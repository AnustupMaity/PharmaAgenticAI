# PharmaAgenticAI
## Agentic AI System for Intelligent Pharmaceutical Assistance

PharmaAgenticAI is an AI-powered multi-agent system designed to assist in pharmaceutical workflows such as drug information retrieval, intelligent querying, and healthcare decision support.

This project was developed as part of the EY Techathon, with a focus on applying agentic AI systems to solve real-world healthcare challenges.

The system leverages modern large language models and agent-based architectures to enable autonomous task decomposition, reasoning, and response generation in the pharmaceutical domain.

---

## Key Features

* Multi-agent architecture for task delegation and coordination
* Pharmaceutical knowledge assistance for drug-related queries
* Natural language interface for user interaction
* Context-aware reasoning using LLMs
* Integration with external tools and knowledge sources
* Multi-step query handling and response aggregation

---

## System Architecture

```text
       User Query
           |
    Controller Agent
           |
-------------------------------
|             |               |
Drug Agent  Search Agent  Reasoning Agent
|             |               |
-------------------------------
           |
    Aggregation Layer
           |
     Final Response
```

---

## Technology Stack

| Layer | Technology |
| :--- | :--- |
| AI / LLM | OpenAI / GPT / LLM APIs |
| Agent Framework | LangChain / CrewAI / Custom |
| Backend | Python |
| API Framework | FastAPI / Flask |
| Database | Supabase / PostgreSQL |
| Authentication | JWT / Email OTP |
| Deployment | Docker / Vercel / Render |

---

## Project Structure

```text
PharmaAgenticAI/
|-- agents/
|-- tools/
|-- api/
|-- frontend/
|-- utils/
|-- config/
|-- main.py
|-- requirements.txt
|-- README.md
```

---

## Installation and Setup

### 1. Clone the Repository
```bash
git clone [https://github.com/AnustupMaity/PharmaAgenticAI.git](https://github.com/AnustupMaity/PharmaAgenticAI.git)
cd PharmaAgenticAI
```

### 2. Create Virtual Environment
```bash
# Linux/Mac
python -m venv venv
source venv/bin/activate

# Windows
python -m venv venv
venv\Scripts\activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables
Create a `.env` file in the root directory:
```env
OPENAI_API_KEY=your_api_key
DATABASE_URL=your_database_url
```

### 5. Run the Application
```bash
python main.py
```

---

## Usage

The system accepts natural language queries related to pharmaceutical and medical topics.

Example queries:
* "What are the side effects of Paracetamol?"
* "Suggest medication for mild fever."
* "Check interaction between two drugs."

Workflow:
* The query is analyzed by a controller agent.
* Tasks are distributed among specialized agents.
* Results are aggregated and returned as a final response.

---

## How It Works

1. User submits a query
2. Controller agent determines intent and task breakdown
3. Domain-specific agents process subtasks
4. Intermediate results are combined
5. Final response is generated and returned

---

## Future Improvements

* Drug interaction analysis module
* Patient-specific recommendation system
* Integration with biomedical and clinical datasets
* Enhanced reasoning using domain-specific models
* Full-stack user interface

---

## Contributing

Contributions are welcome. Please follow the standard workflow:

Fork the repository -> Create a new branch -> Commit changes -> Submit a pull request

---

## License

This project is licensed under the MIT License.

---

## Author

Anustup Maity
National Institute of Technology, Durgapur

---

## Contact

For questions, issues, or collaboration, please use the GitHub Issues section of the repository.
