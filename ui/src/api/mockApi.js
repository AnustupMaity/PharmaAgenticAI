// Mock API responses for development and testing

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const mockApi = {
  // Mock Master Agent Response
  queryMasterAgent: async (query, context = {}) => {
    await delay(2000) // Simulate processing time
    
    return {
      query,
      synthesized_response: {
        executive_summary: `Based on your query about "${query}", our AI agents have analyzed multiple data sources to provide comprehensive pharmaceutical intelligence. Key market opportunities have been identified with significant growth potential in emerging therapeutic areas.`,
        unified_insights: [
          "Market shows strong growth trajectory with 8.5% CAGR expected",
          "Patent landscape presents opportunities for innovation", 
          "Clinical pipeline demonstrates robust late-stage assets",
          "Competitive dynamics favor early market entrants",
          "Regulatory environment supports accelerated pathways"
        ],
        confidence_score: 0.87,
        synthesis_strategy: "market_analysis"
      },
      agent_responses: {
        iqvia: {
          response_type: "market_data",
          market_data: {
            total_market_size: "$2.5B",
            growth_rate: "8.5%",
            key_segments: ["Oncology", "Immunology", "CNS"]
          },
          insights: [
            "Market expansion driven by aging demographics",
            "Premium pricing sustainable for innovative therapies", 
            "Emerging markets showing double-digit growth"
          ],
          agent: "iqvia"
        },
        patent: {
          response_type: "patent_analysis", 
          patent_data: {
            total_patents: "2,450",
            active_patents: "1,890",
            expiring_soon: "156"
          },
          insights: [
            "Patent cliff opportunity window opening in 2025-2027",
            "Freedom to operate analysis shows clear pathways",
            "Key patents in core technology areas well-protected"
          ],
          agent: "patent"
        },
        trials: {
          response_type: "clinical_trials",
          trials_data: {
            active_trials: "3,250", 
            phase_3_trials: "456",
            recruitment_status: "80% enrolled"
          },
          insights: [
            "High success rates in current indication",
            "Competitive trials show similar efficacy profiles",
            "Patient recruitment ahead of industry average"
          ],
          agent: "trials"
        }
      },
      agents_used: ["iqvia", "patent", "trials", "webintel"],
      timestamp: new Date().toISOString()
    }
  },

  // Mock individual agent responses
  analyzeIQVIAQuery: async (query) => {
    await delay(1500)
    return {
      response_type: "market_analysis",
      market_data: {
        market_size: "$45.2B",
        growth_rate: "7.3%",
        competitive_density: "High"
      },
      insights: [
        "Strong market fundamentals support entry",
        "Biosimilar competition intensifying",
        "Emerging markets driving growth"
      ],
      agent: "iqvia"
    }
  },

  analyzePatentQuery: async (query) => {
    await delay(1200)
    return {
      response_type: "patent_landscape",
      patent_data: {
        relevant_patents: 156,
        freedom_to_operate: "Clear",
        key_expiries: "2026-2028"
      },
      insights: [
        "Patent landscape favorable for new entrants",
        "Key blocking patents expire within 3 years",
        "Robust IP strategy recommended"
      ],
      agent: "patent"
    }
  },

  analyzeTrialsQuery: async (query) => {
    await delay(1800)
    return {
      response_type: "clinical_intelligence",
      trials_data: {
        active_studies: 89,
        success_rate: "67%",
        average_timeline: "4.2 years"
      },
      insights: [
        "Clinical success rates above industry average",
        "Accelerated approval pathways available",
        "Competitor trials showing mixed results"
      ],
      agent: "trials"
    }
  },

  // Mock report generation
  generateReport: async (reportRequest) => {
    await delay(3000)
    return {
      report_id: `rpt_${Date.now()}`,
      title: `Pharmaceutical Intelligence Report - ${new Date().toLocaleDateString()}`,
      status: "completed",
      pages: Math.floor(Math.random() * 50) + 20,
      sections: [
        { name: "Executive Summary", pages: 3 },
        { name: "Market Analysis", pages: 12 },
        { name: "Competitive Landscape", pages: 15 },
        { name: "Patent Intelligence", pages: 8 },
        { name: "Clinical Pipeline", pages: 10 },
        { name: "Strategic Recommendations", pages: 5 }
      ],
      download_url: "/reports/mock-report.pdf"
    }
  },

  // Mock report templates
  getReportTemplates: async () => {
    await delay(500)
    return {
      templates: [
        {
          id: "market_analysis",
          name: "Market Analysis Report",
          description: "Comprehensive market sizing, growth projections, and competitive landscape"
        },
        {
          id: "competitive_intelligence", 
          name: "Competitive Intelligence Report",
          description: "Deep-dive competitor analysis with pipeline, positioning, and strategy"
        },
        {
          id: "patent_landscape",
          name: "Patent Landscape Report", 
          description: "IP analysis, patent cliff assessment, and freedom to operate"
        },
        {
          id: "clinical_pipeline",
          name: "Clinical Pipeline Report",
          description: "Trial intelligence, success predictions, and regulatory timeline"
        }
      ]
    }
  },

  // Health check
  healthCheck: async () => {
    await delay(200)
    return {
      status: "healthy",
      service: "PharmaAI Mock API",
      agents: {
        master: "active",
        iqvia: "active", 
        patent: "active",
        trials: "active",
        webintel: "active",
        exim: "active"
      }
    }
  }
}

export default mockApi
