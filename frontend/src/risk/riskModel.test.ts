import { describe, it, expect, beforeAll } from 'vitest';
import { computeRisk, type RiskModelData } from './riskModel';
import fs from 'fs';
import path from 'path';

describe('riskModel', () => {
  let modelData: RiskModelData;

  beforeAll(() => {
    const modelPath = path.resolve(__dirname, '../../public/model.json');
    const rawData = fs.readFileSync(modelPath, 'utf8');
    modelData = JSON.parse(rawData);
  });

  const testCases = [
  {
    "input": {
      "pain_score": 2.0,
      "stiffness_score": 2.0,
      "function_score": 3.0,
      "knee_angle_left": 9.296183857447978,
      "knee_angle_right": 10.387098406406835,
      "knee_rom_left": 84.90355187962592,
      "knee_rom_right": 129.00990058078824,
      "symmetry_index": 0.9892245856918793,
      "cadence": 101.63814813803221,
      "step_time": 0.6289789032896371
    },
    "expected_score": 0.37028310871571635,
    "expected_logit": -0.5310024677260555,
    "expected_contributions": [
      -0.5747486868784405,
      0.8478536517667524,
      -0.4115674872236652,
      0.001514105563782423,
      -0.006525892943307347,
      0.259224058400148,
      -0.13357636114284582,
      -0.6151385184520364,
      -0.04628784830022355,
      0.13079683333418105
    ],
    "expected_level": "Low"
  },
  {
    "input": {
      "pain_score": 6.0,
      "stiffness_score": 1.0,
      "function_score": 2.0,
      "knee_angle_left": 8.803240137637111,
      "knee_angle_right": 0.19056029218050874,
      "knee_rom_left": 128.98370290738112,
      "knee_rom_right": 105.6868205587975,
      "symmetry_index": 0.7772104374425408,
      "cadence": 104.20547175955514,
      "step_time": 0.6762351887814176
    },
    "expected_score": 0.6128435387964798,
    "expected_logit": 0.4592807610112538,
    "expected_contributions": [
      0.24808407887451667,
      -0.7339628627234572,
      -0.5644528836663343,
      0.002078669748533342,
      0.1588154344916555,
      -0.05987176121832853,
      0.22535592909746732,
      0.9115734774533436,
      -0.08998898297206273,
      0.3441959837763206
    ],
    "expected_level": "Moderate"
  },
  {
    "input": {
      "pain_score": 2.0,
      "stiffness_score": 2.0,
      "function_score": 9.0,
      "knee_angle_left": 19.569993954703587,
      "knee_angle_right": 5.883148116482667,
      "knee_rom_left": 108.52102603180792,
      "knee_rom_right": 119.56696680346504,
      "symmetry_index": 0.7086232138931481,
      "cadence": 117.89359249989953,
      "step_time": 0.6512140731117434
    },
    "expected_score": 0.9060429578998714,
    "expected_logit": 2.2662490409400853,
    "expected_contributions": [
      -0.5747486868784405,
      0.8478536517667524,
      0.5057448914323492,
      -0.01025240040584085,
      0.06650763189569157,
      0.08825737393567133,
      0.011746376852585125,
      1.4054694642228422,
      -0.32298898455477804,
      0.23120604452365315
    ],
    "expected_level": "High"
  },
  {
    "input": {
      "pain_score": 1.0,
      "stiffness_score": 1.0,
      "function_score": 11.0,
      "knee_angle_left": -4.119463227142692,
      "knee_angle_right": 14.732748287405983,
      "knee_rom_left": 128.56865568943536,
      "knee_rom_right": 128.53482416015225,
      "symmetry_index": 0.9211096110938308,
      "cadence": 128.49263835438168,
      "step_time": 0.5441218199247707
    },
    "expected_score": 0.1407414351204678,
    "expected_logit": -1.8091454700867386,
    "expected_contributions": [
      -0.7804568783166798,
      -0.7339628627234572,
      0.8115156843176874,
      0.016878930298995534,
      -0.076992507380761,
      -0.05686723811432696,
      -0.1262651369161457,
      -0.12464319218102027,
      -0.5034065705562498,
      -0.2523993766643805
    ],
    "expected_level": "Low"
  },
  {
    "input": {
      "pain_score": 3.0,
      "stiffness_score": 2.0,
      "function_score": 6.0,
      "knee_angle_left": -1.621681579868408,
      "knee_angle_right": 15.560062613790993,
      "knee_rom_left": 127.39550512607188,
      "knee_rom_right": 93.33568500073073,
      "symmetry_index": 0.8104750022814754,
      "cadence": 117.87875457278838,
      "step_time": 0.6253870446161993
    },
    "expected_score": 0.7854816577177502,
    "expected_logit": 1.2979018598141865,
    "expected_contributions": [
      -0.3690404954402012,
      0.8478536517667524,
      0.047088702104342045,
      0.014018242551679747,
      -0.09040777120835458,
      -0.048374811663323254,
      0.4154346566388343,
      0.6720356419007476,
      -0.32273641248108265,
      0.1145767774951926
    ],
    "expected_level": "High"
  }
];

  it('matches EXACTLY the Python model probabilities, logits, and contributions for 5 inputs', () => {
    for (const tc of testCases) {
      const result = computeRisk(tc.input, modelData);
      
      // Compare probability
      expect(result.risk_score).toBeCloseTo(tc.expected_score, 5);
      
      // Compare logit
      expect(result.debug?.logit).toBeCloseTo(tc.expected_logit, 5);
      
      // Compare each feature contribution
      const contributions = result.debug?.contributions || [];
      expect(contributions.length).toBe(tc.expected_contributions.length);
      for (let i = 0; i < contributions.length; i++) {
        expect(contributions[i]).toBeCloseTo(tc.expected_contributions[i], 5);
      }

      expect(result.risk_level).toBe(tc.expected_level);
    }
  });

  it('handles missing optional fields with defaults identical to backend', () => {
    const inputWithMissing = {
      pain_score: 5,
      stiffness_score: 1,
      function_score: 5
    };
    
    const inputWithExplicitDefaults = {
      pain_score: 5,
      stiffness_score: 1,
      function_score: 5,
      knee_angle_left: 10.0,
      knee_angle_right: 10.0,
      knee_rom_left: 120.0,
      knee_rom_right: 120.0,
      symmetry_index: 0.9,
      cadence: 100.0,
      step_time: 0.6
    };
    
    const res1 = computeRisk(inputWithMissing, modelData);
    const res2 = computeRisk(inputWithExplicitDefaults, modelData);
    
    expect(res1.risk_score).toBeCloseTo(res2.risk_score, 5);
    expect(res1.risk_level).toEqual(res2.risk_level);
  });
  
  it('sorts top factors correctly for explainability', () => {
    const input = {
      pain_score: 8,
      stiffness_score: 2,
      function_score: 10
    };
    const result = computeRisk(input, modelData);
    const factors = Object.keys(result.explainability_data.top_factors);
    expect(factors.length).toBeLessThanOrEqual(3);
    
    // Check if sorted descending
    const values = Object.values(result.explainability_data.top_factors);
    for (let i = 0; i < values.length - 1; i++) {
      expect(values[i]).toBeGreaterThanOrEqual(values[i+1]);
    }
  });
});
