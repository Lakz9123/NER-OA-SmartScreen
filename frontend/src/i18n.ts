import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "report_title": "Digital Screening Report",
      "preliminary_risk": "Preliminary Risk Indication",
      "clinical_evaluation": "Clinical evaluation by a medical professional is recommended.",
      "synthetic_warning": "WARNING: This model is trained on synthetic sample data, not clinically validated.",
      "risk_level": "Risk Level",
      "confidence": "Model Confidence",
      "pain_score": "Pain Score",
      "stiffness_score": "Stiffness Score",
      "function_score": "Function Score",
      "knee_angle": "Avg Knee Angle",
      "rom": "Range of Motion (ROM)",
      "cadence": "Cadence",
      "download_pdf": "Download PDF",
      "return_dashboard": "Return to Dashboard",
      "high": "High",
      "moderate": "Moderate",
      "low": "Low",
      "key_factors": "Key Risk Factors"
    }
  },
  as: {
    translation: {
      "report_title": "ডিজিটেল স্ক্ৰীনিং ৰিপৰ্ট",
      "preliminary_risk": "প্ৰাথমিক বিপদাশংকা সূচক",
      "clinical_evaluation": "এজন চিকিৎসা পেছাদাৰীৰ দ্বাৰা ক্লিনিকেল মূল্যাঙ্কন কৰা বাঞ্ছনীয়।",
      "synthetic_warning": "সতৰ্কবাণী: এই মডেলটো কৃত্ৰিম নমুনা তথ্যৰ ওপৰত প্ৰশিক্ষণ দিয়া হৈছে, ক্লিনিকেলভাৱে প্ৰমাণিত নহয়।",
      "risk_level": "বিপদৰ স্তৰ",
      "confidence": "মডেলৰ আত্মবিশ্বাস",
      "pain_score": "বিষৰ স্কোৰ",
      "stiffness_score": "জড়তাৰ স্কোৰ",
      "function_score": "কাৰ্য্যৰ স্কোৰ",
      "knee_angle": "গড় আঁঠুৰ কোণ",
      "rom": "গতিৰ পৰিসৰ (ROM)",
      "cadence": "কেডেন্স",
      "download_pdf": "PDF ডাউনলোড কৰক",
      "return_dashboard": "ডেচবৰ্ডলৈ উভতি যাওক",
      "high": "উচ্চ",
      "moderate": "মধ্যমীয়া",
      "low": "নিম্ন",
      "key_factors": "মূল বিপদাশংকা কাৰকসমূহ"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
