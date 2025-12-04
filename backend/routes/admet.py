from flask import Blueprint, request, jsonify
import os
import traceback
from dotenv import load_dotenv
from crewai import Agent, Task, Crew, LLM
from crewai.tools import tool
import json

load_dotenv()

admet_bp = Blueprint('admet', __name__)

# Initialize LLM
llm = LLM(
    model=os.getenv("GEMINI_MODEL", "gemini/gemini-2.0-flash-exp"),
    api_key=os.getenv("GEMINI_API_KEY"),
    temperature=0.1
)


@tool("Calculate Molecular Properties")
def calculate_molecular_properties(smiles: str) -> str:
    """Calculate basic molecular properties from SMILES string including MW, LogP, HBD, HBA, TPSA, Rotatable Bonds.
    
    Args:
        smiles: SMILES representation of the molecule
        
    Returns:
        JSON string with molecular properties
    """
    try:
        from rdkit import Chem
        from rdkit.Chem import Descriptors, Crippen, Lipinski
        
        mol = Chem.MolFromSmiles(smiles)
        if mol is None:
            return json.dumps({"error": "Invalid SMILES string"})
        
        properties = {
            "molecular_weight": round(Descriptors.MolWt(mol), 2),
            "logp": round(Crippen.MolLogP(mol), 2),
            "hbd": Lipinski.NumHDonors(mol),
            "hba": Lipinski.NumHAcceptors(mol),
            "tpsa": round(Descriptors.TPSA(mol), 2),
            "rotatable_bonds": Lipinski.NumRotatableBonds(mol),
            "aromatic_rings": Lipinski.NumAromaticRings(mol),
            "fraction_csp3": round(Lipinski.FractionCsp3(mol), 3),
            "molar_refractivity": round(Crippen.MolMR(mol), 2)
        }
        
        return json.dumps(properties)
    except Exception as e:
        return json.dumps({"error": str(e)})


@tool("Predict Lipinski Rule of Five")
def predict_lipinski(smiles: str) -> str:
    """Predict Lipinski's Rule of Five compliance for drug-likeness.
    
    Args:
        smiles: SMILES representation of the molecule
        
    Returns:
        JSON string with Lipinski analysis
    """
    try:
        from rdkit import Chem
        from rdkit.Chem import Descriptors, Crippen, Lipinski
        
        mol = Chem.MolFromSmiles(smiles)
        if mol is None:
            return json.dumps({"error": "Invalid SMILES string"})
        
        mw = Descriptors.MolWt(mol)
        logp = Crippen.MolLogP(mol)
        hbd = Lipinski.NumHDonors(mol)
        hba = Lipinski.NumHAcceptors(mol)
        
        violations = []
        if mw > 500:
            violations.append("MW > 500")
        if logp > 5:
            violations.append("LogP > 5")
        if hbd > 5:
            violations.append("HBD > 5")
        if hba > 10:
            violations.append("HBA > 10")
        
        result = {
            "passes_lipinski": len(violations) <= 1,
            "violations": violations,
            "violation_count": len(violations),
            "values": {
                "molecular_weight": round(mw, 2),
                "logp": round(logp, 2),
                "hbd": hbd,
                "hba": hba
            }
        }
        
        return json.dumps(result)
    except Exception as e:
        return json.dumps({"error": str(e)})


@tool("Predict ADMET Properties")
def predict_admet_properties(smiles: str) -> str:
    """Predict ADMET properties including absorption, BBB penetration, bioavailability, metabolism.
    
    Args:
        smiles: SMILES representation of the molecule
        
    Returns:
        JSON string with ADMET predictions
    """
    try:
        from rdkit import Chem
        from rdkit.Chem import Descriptors, Crippen, Lipinski
        
        mol = Chem.MolFromSmiles(smiles)
        if mol is None:
            return json.dumps({"error": "Invalid SMILES string"})
        
        # Calculate key descriptors
        mw = Descriptors.MolWt(mol)
        logp = Crippen.MolLogP(mol)
        tpsa = Descriptors.TPSA(mol)
        hbd = Lipinski.NumHDonors(mol)
        hba = Lipinski.NumHAcceptors(mol)
        rotatable = Lipinski.NumRotatableBonds(mol)
        
        # Absorption prediction (based on Lipinski and Veber rules)
        good_absorption = (
            mw <= 500 and
            logp <= 5 and
            hbd <= 5 and
            hba <= 10 and
            rotatable <= 10 and
            tpsa <= 140
        )
        
        # BBB penetration (simplified rule: MW < 400, LogP 1-3, TPSA < 90, HBD < 3)
        bbb_penetration = (
            mw < 400 and
            1 <= logp <= 3 and
            tpsa < 90 and
            hbd < 3
        )
        
        # Oral bioavailability estimate
        bioavailability_score = 0
        if mw <= 500: bioavailability_score += 1
        if logp <= 5: bioavailability_score += 1
        if tpsa <= 140: bioavailability_score += 1
        if rotatable <= 10: bioavailability_score += 1
        if hbd <= 5 and hba <= 10: bioavailability_score += 1
        bioavailability = "High" if bioavailability_score >= 4 else "Medium" if bioavailability_score >= 3 else "Low"
        
        # CYP450 substrate prediction (simplified)
        # Typically substrates have MW 200-700, LogP 0-5
        cyp_substrate = 200 <= mw <= 700 and 0 <= logp <= 5
        
        # Aqueous solubility estimate (LogS approximation)
        logs_estimate = 0.5 - 0.01 * mw - logp
        solubility = "High" if logs_estimate > -2 else "Medium" if logs_estimate > -4 else "Low"
        
        predictions = {
            "absorption": {
                "good_absorption": good_absorption,
                "intestinal_absorption": "High" if good_absorption else "Medium"
            },
            "distribution": {
                "bbb_penetration": "Likely" if bbb_penetration else "Unlikely",
                "protein_binding": "High" if logp > 3 else "Medium" if logp > 1 else "Low"
            },
            "metabolism": {
                "cyp450_substrate": "Likely" if cyp_substrate else "Unlikely",
                "metabolic_stability": "Medium"
            },
            "excretion": {
                "renal_clearance": "Moderate"
            },
            "toxicity": {
                "hepatotoxicity_risk": "Low" if mw < 500 and logp < 5 else "Medium",
                "mutagenicity_risk": "Low",
                "cardiotoxicity_risk": "Low" if tpsa < 150 else "Medium"
            },
            "bioavailability": bioavailability,
            "solubility": solubility,
            "drug_likeness_score": round(bioavailability_score / 5, 2)
        }
        
        return json.dumps(predictions)
    except Exception as e:
        return json.dumps({"error": str(e)})


def create_admet_crew(smiles: str, compound_name: str):
    """Create a crew to analyze ADMET properties of a compound."""
    
    molecular_analyst = Agent(
        role="Molecular Property Analyst",
        goal=f"Analyze molecular properties and drug-likeness of {compound_name}",
        backstory="You are an expert computational chemist specializing in molecular property calculation and drug-likeness assessment.",
        tools=[calculate_molecular_properties, predict_lipinski],
        llm=llm,
        verbose=True
    )
    
    admet_specialist = Agent(
        role="ADMET Prediction Specialist",
        goal=f"Predict ADMET properties and pharmacokinetic profile of {compound_name}",
        backstory="You are a pharmaceutical scientist with expertise in ADMET prediction, pharmacokinetics, and drug safety assessment.",
        tools=[predict_admet_properties],
        llm=llm,
        verbose=True
    )
    
    medicinal_chemist = Agent(
        role="Medicinal Chemistry Advisor",
        goal=f"Provide actionable recommendations for optimizing {compound_name}",
        backstory="You are a senior medicinal chemist who provides strategic guidance on molecular optimization and lead compound development.",
        llm=llm,
        verbose=True
    )
    
    # Tasks
    property_analysis_task = Task(
        description=f"Calculate molecular properties and assess Lipinski Rule of Five compliance for the compound with SMILES: {smiles}. Provide detailed analysis.",
        agent=molecular_analyst,
        expected_output="Comprehensive molecular property report with Lipinski analysis"
    )
    
    admet_prediction_task = Task(
        description=f"Predict ADMET properties for the compound with SMILES: {smiles}. Analyze absorption, distribution, metabolism, excretion, and toxicity.",
        agent=admet_specialist,
        expected_output="Detailed ADMET prediction report with risk assessment",
        context=[property_analysis_task]
    )
    
    optimization_task = Task(
        description=f"Based on the molecular properties and ADMET predictions, provide specific recommendations for optimizing {compound_name} as a drug candidate. Highlight strengths, weaknesses, and suggest structural modifications.",
        agent=medicinal_chemist,
        expected_output="Strategic medicinal chemistry recommendations with optimization strategies",
        context=[property_analysis_task, admet_prediction_task]
    )
    
    crew = Crew(
        agents=[molecular_analyst, admet_specialist, medicinal_chemist],
        tasks=[property_analysis_task, admet_prediction_task, optimization_task],
        verbose=True
    )
    
    return crew


@admet_bp.route('/predict', methods=['POST'])
def predict_admet():
    """Predict ADMET properties for a compound."""
    try:
        data = request.get_json() or {}
        smiles = data.get('smiles', '').strip()
        compound_name = data.get('compound_name', 'Unknown Compound').strip()
        
        if not smiles:
            return jsonify({
                "success": False,
                "error": "SMILES string is required"
            }), 400
        
        # Validate SMILES
        try:
            from rdkit import Chem
            mol = Chem.MolFromSmiles(smiles)
            if mol is None:
                return jsonify({
                    "success": False,
                    "error": "Invalid SMILES string"
                }), 400
        except Exception as e:
            return jsonify({
                "success": False,
                "error": f"SMILES validation error: {str(e)}"
            }), 400
        
        # Create and run crew
        crew = create_admet_crew(smiles, compound_name)
        result = crew.kickoff()
        
        # Also get raw predictions for UI display
        raw_properties = json.loads(calculate_molecular_properties.func(smiles))
        raw_lipinski = json.loads(predict_lipinski.func(smiles))
        raw_admet = json.loads(predict_admet_properties.func(smiles))
        
        return jsonify({
            "success": True,
            "compound_name": compound_name,
            "smiles": smiles,
            "report": str(result),
            "properties": raw_properties,
            "lipinski": raw_lipinski,
            "admet": raw_admet
        }), 200
        
    except Exception as e:
        traceback.print_exc()
        return jsonify({
            "success": False,
            "error": str(e),
            "error_type": type(e).__name__
        }), 500


@admet_bp.route('/quick-predict', methods=['POST'])
def quick_predict():
    """Quick ADMET prediction without AI analysis (faster)."""
    try:
        data = request.get_json() or {}
        smiles = data.get('smiles', '').strip()
        
        if not smiles:
            return jsonify({
                "success": False,
                "error": "SMILES string is required"
            }), 400
        
        # Validate and get predictions
        from rdkit import Chem
        mol = Chem.MolFromSmiles(smiles)
        if mol is None:
            return jsonify({
                "success": False,
                "error": "Invalid SMILES string"
            }), 400
        
        properties = json.loads(calculate_molecular_properties.func(smiles))
        lipinski = json.loads(predict_lipinski.func(smiles))
        admet = json.loads(predict_admet_properties.func(smiles))
        
        return jsonify({
            "success": True,
            "smiles": smiles,
            "properties": properties,
            "lipinski": lipinski,
            "admet": admet
        }), 200
        
    except Exception as e:
        traceback.print_exc()
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@admet_bp.route('/health', methods=['GET'])
def health():
    """Health check endpoint."""
    return jsonify({
        "status": "healthy",
        "service": "admet-prediction"
    }), 200
