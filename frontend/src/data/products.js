// Products module with imported image assets so bundlers can resolve and include them in production
import mustard_0 from '../assets/products/1_Mustard_Oil_0.png'
import mustard_1 from '../assets/products/1_Mustard_Oil.png'
import mustard_1_1 from '../assets/products/1_Mustard_Oil_1.png'
import groundnut_1 from '../assets/products/2_Groundnut_Oil.png'
import groundnut_1_1 from '../assets/products/2_Groundnut_Oil_1.png'
import coconut_1 from '../assets/products/coconut_1.png'
import coconut_2 from '../assets/products/coconut_2.png'
import sesame_1 from '../assets/products/sesame_1.png'
import sesame_2 from '../assets/products/sesame_2.png'
import sunflower_1 from '../assets/products/sunflower_1.png'
import sunflower_2 from '../assets/products/sunflower_2.png'
import flax_1 from '../assets/products/Flaxseed_1.png'
import flax_2 from '../assets/products/Flaxseed_2.png'
import turmeric_1 from '../assets/products/3_Turmeric_Powder.png'
import turmeric_1_1 from '../assets/products/3_Turmeric_Powder_1.png'
import cardamom_1 from '../assets/products/4_Cardamom.png'
import cardamom_1_1 from '../assets/products/4_Cardamom_1.png'
import cumin_1 from '../assets/products/5_Cumin_Seeds.png'
import cumin_1_1 from '../assets/products/5_Cumin_Seeds_1.png'
import cinnamon_1 from '../assets/products/6_Cinnamon_Sticks.png'
import cinnamon_1_1 from '../assets/products/6_Cinnamon_Sticks_1.png'
import blackpepper_1 from '../assets/products/7_Black_Pepper.png'
import blackpepper_1_1 from '../assets/products/7_Black_Pepper_1.png'
import coriander_1 from '../assets/products/8_Coriander_Seeds.png'
import coriander_1_1 from '../assets/products/8_Coriander_Seeds_1.png'
import fenugreek_1 from '../assets/products/9_Fenugreek_Seeds_1.png'
import cloves_1 from '../assets/products/10_Cloves_1.png'
import bay_1 from '../assets/products/11_Bay_Leaves_1.png'
import bay_2 from '../assets/products/11_Bay_Leaves_2.png'
import fennel_1 from '../assets/products/12_Fennel_Seeds_1.png'
import saffron_1 from '../assets/products/13_Saffron_1.png'
import saffron_2 from '../assets/products/13_Saffron_2.png'
import chilli_1 from '../assets/products/14_Red_Chilli_Powder_1.png'
import chilli_2 from '../assets/products/14_Red_Chilli_Powder_2.png'

const products = [
  {
    id: 1,
    name: "Mustard Oil (Kacchi Ghani)",
    name_hi: "सरसों का तेल (कच्ची घानी)",
    price: 190,
    image: mustard_0,
    images: [ mustard_0,mustard_1, mustard_1_1,groundnut_1, groundnut_1_1 ],
    category: "Oils",
    variants: [ { id: "v1a", label: "1 L", price: 195 }, { id: "v1b", label: "2 L", price: 390 }, { id: "v1c", label: "5 L", price: 950 } ],
    description: "Authentic Kacchi Ghani Mustard Oil, cold-pressed to retain its natural 'Jhaanjh' (pungency). Extracted from premium mustard seeds of Rajasthan, it is the soul of North Indian and Bengali kitchens.",
    description_hi: "असली कच्ची घानी सरसों का तेल, जो अपने प्राकृतिक तीखेपन (झांझ) को बरकरार रखता है। राजस्थान के प्रीमियम बीजों से निकाला गया, यह उत्तर भारतीय और बंगाली व्यंजनों की जान है।",
    usage: "Perfect for frying, making long-lasting pickles (Achaar), and traditional body massage.",
    usage_hi: "तलने, अचार बनाने और पारंपरिक मालिश के लिए उत्तम।",
    storage: "Store in a cool, dry place. Keep the lid tight to maintain its pungent aroma.",
    storage_hi: "ठंडी, सूखी जगह पर स्टोर करें और ढक्कन बंद रखें ताकि इसकी तीखी खुशबू बनी रहे।",
    manufacturer: "Madhuban Oils Co.",
    origin: "Rajasthan, India",
    ingredients: ["Cold-pressed mustard oil"],
    healthBenefits: [
      "Rich in MUFA for heart health",
      "Natural anti-bacterial agent for food preservation",
      "Stimulates digestion and circulation",
      "Traditional remedy for respiratory relief when used topically",
      "Good for skin and hair when used topically"
    ],

    healthBenefits_hi: [
      "हृदय स्वास्थ्य के लिए MUFA से भरपूर",
      "भोजन संरक्षण के लिए प्राकृतिक एंटी-बैक्टीरियल गुण",
      "पाचन और रक्त संचार को उत्तेजित करता है",
      "श्वसन राहत के लिए पारंपरिक उपचार",
      "त्वचा और बालों के लिए फायदेमंद"
    ],

    certifications: ["FSSAI"]
  },
  {
    id: 2,
    name: "Groundnut Oil (Mugfali)",
    name_hi: "मूंगफली का तेल",
    price: 70,
    image: groundnut_1,
    images: [ groundnut_1, groundnut_1_1 ],
    category: "Oils",
    variants: [ { id: "v2a", label: "250 ml", price: 75 }, { id: "v2b", label: "500 ml", price: 150 }, { id: "v2c", label: "1 L", price: 300 } ],
    description: "Pure cold-pressed groundnut oil sourced from Saurashtra. It has a high smoke point and a delicate nutty flavor that doesn't overpower the food.",
    description_hi: "सौराष्ट्र से प्राप्त शुद्ध कोल्ड-प्रेस्ड मूंगफली का तेल। इसका स्मोक पॉइंट उच्च है और स्वाद हल्का नटी है जो खाने के असली स्वाद को दबने नहीं देता।",
    usage: "Best for deep frying snacks like Pakoras and Puris, and making South Indian chutneys.",
    usage_hi: "पकोड़े और पूरियों को तलने और दक्षिण भारतीय चटनी बनाने के लिए सर्वश्रेष्ठ।",
    storage: "Store in a cool place away from sunlight.",
    storage_hi: "ठंडी जगह पर रखें और प्रत्यक्ष सूर्य से दूर रखें।",
    manufacturer: "Madhuban Oils Co.",
    origin: "Gujarat, India",
    ingredients: ["Cold-pressed groundnut oil"],
    healthBenefits: [
      "Contains Phytosterols that help lower cholesterol",
      "Rich in Vitamin E, a powerful antioxidant",
      "Resistant to oxidation at high temperatures",
      "Promotes skin health and anti-aging",
      "High smoke point for frying"
    ],
    healthBenefits_hi: [
      "कोलेस्ट्रॉल कम करने वाले फाइटोस्टेरॉल युक्त",
      "विटामिन ई (एंटीऑक्सीडेंट) का समृद्ध स्रोत",
      "उच्च तापमान पर सुरक्षित (ऑक्सीकरण प्रतिरोधी)",
      "त्वचा के स्वास्थ्य और एंटी-एजिंग में सहायक",
      "तलने के लिए उच्च स्मोक पॉइंट"
    ],
    certifications: ["FSSAI"]
  },
  {
    id: 3,
    name: "Coconut Oil (Nariyala)",
    name_hi: "नारियल का तेल",
    price: 150,
    image: coconut_1,
    images: [ coconut_1, coconut_2 ],
    category: "Oils",
    variants: [ { id: "v3a", label: "250 ml", price: 250 }, { id: "v3b", label: "500 ml", price: 495 }, { id: "v3c", label: "1 L", price: 990 } ],
    description: "Cold-pressed  coconut oil — excellent for cooking and hair/skin care.",
    description_hi: "कोल्ड-प्रेस्ड शुद्ध नारियल का तेल — खाना पकाने और बाल/त्वचा के लिए उत्कृष्ट। 100% शुद्ध नारियल का तेल।",
    usage: "Cooking, hair oiling, skin moisturiser",
    usage_hi: "खाना पकाने, बालों की मालिश, त्वचा के लिए मॉइस्चराइजर",
    storage: "Store in a cool, dry place away from sunlight.",
    storage_hi: "धूप से दूर ठंडी और सूखी जगह पर स्टोर करें।",
    manufacturer: "Madhuban Oils Co.",
    origin: "Kerala, India",
    ingredients: ["100%  coconut oil"],
    healthBenefits: [ "Contains MCTs for instant energy boost",
      "Lauric acid supports immune system health",
      "Excellent for thyroid and metabolic health",
      "Anti-fungal and anti-microbial properties","Promotes hair and skin health", "Contains medium-chain triglycerides"],
    healthBenefits_hi: ["त्वरित ऊर्जा के लिए MCTs से भरपूर",
      "लौरिक एसिड रोग प्रतिरोधक क्षमता बढ़ाता है",
      "थायराइड और मेटाबॉलिज्म के लिए बेहतरीन",
      "एंटी-फंगल और एंटी-माइक्रोबियल गुण","बाल और त्वचा के स्वास्थ्य को बढ़ावा देता है", "मीडियम-चेन ट्राइग्लिसराइड्स से भरपूर"],
    certifications: ["FSSAI", "Organic"]
  },
  {
    id: 4,
    name: "Sesame Oil (Til)",
    name_hi: "तिल का तेल",
    price: 200,
    image: sesame_1,
    images: [ sesame_1, sesame_2 ],
    category: "Oils",
    variants: [ { id: "v4a", label: "250 ml", price: 200 }, { id: "v4b", label: "500 ml", price: 380 }, { id: "v4c", label: "1 L", price: 720 } ],
    description: "Cold-pressed sesame (til) oil — rich, nutty flavour ideal for seasoning and cooking.",
    description_hi: "कोल्ड-प्रेस्ड तिल का तेल — समृद्ध, नट्टी स्वाद, खाना पकाने और सीज़निंग के लिए उपयुक्त।",
    usage: "Cooking, seasoning, massage oil",
    usage_hi: "खाना पकाने, सीज़निंग, मालिश के लिए",
    storage: "Keep in a cool, dark place in an airtight container.",
    storage_hi: "एयरटाइट कंटेनर में ठंडी और अंधी जगह पर रखें।",
    manufacturer: "Madhuban Oils Co.",
    origin: "Gujarat, India",
    ingredients: ["100% cold-pressed sesame oil"],
    healthBenefits: ["Good source of antioxidants", "May support heart health"],
    healthBenefits_hi: ["एंटीऑक्सीडेंट का अच्छा स्रोत", "हृदय स्वास्थ्य में सहायक हो सकता है"],
    certifications: ["FSSAI"]
  },
  {
    id: 5,
    name: "Sunflower Oil (Sursajmukhi)",
    name_hi: "सूरजमुखी का तेल",
    price: 95,
    image: sunflower_1,
    images: [ sunflower_1, sunflower_2 ],
    category: "Oils",
    variants: [ { id: "v5a", label: "500 ml", price: 95 }, { id: "v5b", label: "1 L", price: 180 }, { id: "v5c", label: "5 L", price: 700 } ],
    description: "A light and healthy cooking oil that is easy on the stomach. Our sunflower oil is refined to ensure a high smoke point, making it ideal for the diverse Indian kitchen.",
    description_hi: "एक हल्का और स्वस्थ खाना पकाने का तेल जो पाचन में आसान है। यह तेल भारतीय रसोई की विविध जरूरतों के लिए बनाया गया है।",
    usage: "Daily sautéing, deep frying, and baking.",
    usage_hi: "रोजाना खाना पकाने, तलने और बेकिंग के लिए।",
    storage: "Store in a cool place away from light.",
    manufacturer: "Madhuban Oils Co.",
    origin: "Madhya Pradesh, India",
    ingredients: ["Refined Sunflower Oil"],
    healthBenefits: [
      "Extremely rich in Vitamin E for immunity",
      "Low in saturated fats, good for weight management",
      "Contains Lecithin which helps lower cholesterol",
      "Promotes healthy hair and prevents thinning"
    ],
    healthBenefits_hi: [
      "इम्युनिटी के लिए विटामिन ई से भरपूर",
      "वजन घटाने के लिए कम सैचुरेटेड फैट",
      "कोलेस्ट्रॉल कम करने में सहायक लेसिथिन युक्त",
      "बालों को झड़ने से रोकने में मददगार"
    ],
    certifications: ["FSSAI"]
  },
  {
    id: 6,
    name: "Flaxseed Oil (Tisi)",
    name_hi: "अलसी(तीसी) का तेल",
    price: 320,
    image: flax_1,
    images: [ flax_1, flax_2 ],
    category: "Oils",
    variants: [ { id: "v6a", label: "250 ml", price: 320 }, { id: "v6b", label: "500 ml", price: 600 }, { id: "v6c", label: "1 L", price: 1100 } ],
    description: "A vegetarian powerhouse of Omega-3. This cold-pressed oil is made from high-quality Alsi seeds from Punjab, perfect for those seeking a plant-based health supplement.",
    description_hi: "ओमेगा-3 का शाकाहारी खजाना। पंजाब के उच्च गुणवत्ता वाले अलसी के बीजों से बना यह तेल स्वास्थ्य सप्लीमेंट के रूप में उत्तम है।",
    usage: "Drizzle over salads, mix in smoothies, or take a spoonful daily. Do not heat.",
    usage_hi: "सलाद पर डालें, स्मूदी में मिलाएं या रोजाना एक चम्मच लें। इसे गर्म न करें।",
    storage: "Always refrigerate to prevent bitterness (rancidity).",
    manufacturer: "Madhuban Oils Co.",
    origin: "Punjab, India",
    ingredients: ["100% Cold-pressed Flaxseed Oil"],
    healthBenefits: [
      "Highest plant source of Alpha-linolenic acid (Omega-3)",
      "Reduces inflammation in joints and arteries",
      "Improves skin smoothness and hydration",
      "Supports hormonal balance in women"
    ],
    healthBenefits_hi: [
      "ओमेगा-3 (ALA) का उच्चतम शाकाहारी स्रोत",
      "जोड़ों और धमनियों की सूजन को कम करता है",
      "त्वचा की कोमलता और नमी को सुधारता है",
      "महिलाओं में हार्मोनल संतुलन का समर्थन करता है"
    ],
    certifications: ["FSSAI"]
  },
  {
    id: 7,
    name: "Turmeric Powder (Haldi)",
    name_hi: "हल्दी पाउडर",
    price: 80,
    image: turmeric_1,
    images: [ turmeric_1, turmeric_1_1 ],
    category: "Spices",
    variants: [ { id: "v7a", label: "100 g", price: 80 }, { id: "v7b", label: "250 g", price: 180 }, { id: "v7c", label: "500 g", price: 320 } ],
    description: "High-Curcumin (min 3.5%) Turmeric powder sourced from Salem. Guaranteed free from lead chromate and artificial starch.",
    description_hi: "सेलम से प्राप्त उच्च करक्यूमिन युक्त हल्दी पाउडर। मिलावट रहित और शुद्ध औषधीय गुणों से भरपूर।",
    usage: "Basic curry spice, Golden Milk, and Ayurvedic face masks.",
    usage_hi: "मसाला करी, हल्दी वाला दूध और फेस पैक के लिए।",
    storage: "Store in an airtight container in a dark place.",
    manufacturer: "Madhuban Spices",
    origin: "Tamil Nadu, India",
    shelfLife: "12 Months",
    culinaryProfile: "Earthy, warm, and peppery.",
    ingredients: ["100% Pure Ground Turmeric"],
    healthBenefits: [
      "Powerful natural anti-inflammatory agent",
      "Enhances immunity against seasonal infections",
      "Supports liver detoxification",
      "Promotes wound healing and healthy skin"
    ],
    healthBenefits_hi: [
      "शक्तिशाली प्राकृतिक सूजन-रोधी",
      "मौसमी संक्रमणों के खिलाफ इम्युनिटी बढ़ाता है",
      "लिवर की सफाई में सहायक",
      "घाव भरने और त्वचा निखारने में मददगार"
    ],
    certifications: ["Organic", "FSSAI"]
  },
  {
    id: 8,
    name: "Cardamom (Elaichi)",
    name_hi: "इलायची",
    price: 140,
    image: cardamom_1,
    images: [ cardamom_1, cardamom_1_1 ],
    category: "Spices",
    variants: [ { id: "v8a", label: "25 g", price: 140 }, { id: "v8b", label: "50 g", price: 260 }, { id: "v8c", label: "100 g", price: 480 } ],
    description: "8mm bold, lush green cardamom pods from the Idukki hills of Kerala. Packed with essential oils for an unmatched aroma.",
    description_hi: "केरल की पहाड़ियों से प्राप्त 8mm बोल्ड हरी इलायची। लाजवाब खुशबू के लिए प्राकृतिक तेलों से भरपूर।",
    usage: "Masala Chai, sweets like Kheer, and biryanis.",
    usage_hi: "मसाला चाय, खीर जैसी मिठाइयों और बिरयानी में।",
    storage: "Keep in a cool, dry place in an airtight container.",
    storage_hi: "ठंडी और सूखी जगह पर एयरटाइट डिब्बे में रखें।",
    manufacturer: "Madhuban Spices",
    origin: "Kerala, India",
    shelfLife: "12 Months",
    culinaryProfile: "Floral, sweet, and cooling.",
    ingredients: ["Whole Green Cardamom"],
    healthBenefits: [
      "Excellent natural mouth freshener",
      "Aids in digestion and reduces acidity",
      "Helps in detoxifying the body through kidneys",
      "Traditionally used for blood pressure management"
    ],
    healthBenefits_hi: [
      "बेहतरीन प्राकृतिक माउथ फ्रेशनर",
      "पाचन में सुधार और एसिडिटी कम करता है",
      "किडनी के माध्यम से शरीर को डिटॉक्स करता है",
      "ब्लड प्रेशर नियंत्रित करने में सहायक"
    ],
    certifications: ["FSSAI"]
  },
  {
    id: 9,
    name: "Cumin (Jira) Seeds",
    name_hi: "साबुत जीरा",
    price: 50,
    image: cumin_1,
    images: [ cumin_1, cumin_1_1 ],
    category: "Spices",
    variants: [ { id: "v9a", label: "100 g", price: 50 }, { id: "v9b", label: "250 g", price: 100 }, { id: "v9c", label: "500 g", price: 180 } ],
    description: "Selected premium quality Cumin seeds from Unjha, Gujarat. These seeds are machine-cleaned and hand-graded for the perfect 'Tadka'.",
    description_hi: "गुजरात के उंझा से प्राप्त प्रीमियम गुणवत्ता वाला जीरा। बेहतरीन तड़के के लिए मशीनी सफाई और हैंड-ग्रेडिंग की गई।",
    usage: "Essential for 'Dal Tadka', Jeera Rice, and roasted cumin powder (Bhuna Jeera).",
    usage_hi: "दाल तड़का, जीरा राइस और भुना जीरा पाउडर के लिए अनिवार्य।",
    storage: "Store in a cool, dry place in an airtight jar.",
    manufacturer: "Madhuban Spices",
    origin: "Gujarat, India",
    shelfLife: "12 Months",
    culinaryProfile: "Earthy, nutty, and intense.",
    ingredients: ["Whole Cumin Seeds"],
    healthBenefits: [
      "Contains Thymol which stimulates digestive enzymes",
      "Rich source of Iron for energy and immunity",
      "Helpful in managing blood sugar levels",
      "Aids weight loss by improving metabolism"
    ],
    healthBenefits_hi: [
      "थाइमोल युक्त जो पाचन एंजाइमों को उत्तेजित करता है",
      "ऊर्जा और इम्युनिटी के लिए आयरन का समृद्ध स्रोत",
      "ब्लड शुगर लेवल को नियंत्रित करने में सहायक",
      "मेटाबॉलिज्म सुधारकर वजन घटाने में मदद करता है"
    ],
    certifications: ["FSSAI"]
  },
  {
    id: 10,
    name: "Cinnamon (Dalchini) Sticks",
    name_hi: "दालचीनी",
    price: 140,
    image: cinnamon_1,
    images: [ cinnamon_1, cinnamon_1_1 ],
    category: "Spices",
    variants: [ { id: "v10a", label: "50 g", price: 140 }, { id: "v10b", label: "100 g", price: 260 }, { id: "v10c", label: "250 g", price: 600 } ],
    description: "Premium sweet-scented Cinnamon sticks. Unlike common Cassia, our bark is chosen for its thin layers and delicate, non-bitter flavor.",
    description_hi: "प्रीमियम खुशबूदार दालचीनी की छड़ें। अपनी पतली परतों और मीठे स्वाद के लिए चुनी गई।",
    usage: "Flavoring Pulao, Kadha (herbal tea), and baking.",
    usage_hi: "पुलाव, काढ़ा और बेकिंग में स्वाद बढ़ाने के लिए।",
    storage: "Store in an airtight container to keep the aroma intact.",
    storage_hi: "खुशबू बनाए रखने के लिए एयरटाइट डिब्बे में रखें।",
    manufacturer: "Madhuban Spices",
    origin: "Sri Lanka/South India",
    shelfLife: "18 Months",
    culinaryProfile: "Sweet, woody, and warm.",
    ingredients: ["Pure Cinnamon Bark"],
    healthBenefits: [
      "Improves insulin sensitivity (great for diabetics)",
      "Reduces bad cholesterol (LDL)",
      "Natural breath freshener and oral health booster",
      "Anti-viral properties help fight common colds"
    ],
    healthBenefits_hi: [
      "इंसुलिन संवेदनशीलता सुधारता है (मधुमेह रोगियों के लिए अच्छा)",
      "खराब कोलेस्ट्रॉल (LDL) को कम करता है",
      "प्राकृतिक माउथ फ्रेशनर और ओरल हेल्थ बूस्टर",
      "सामान्य सर्दी से लड़ने में एंटी-वायरल गुण"
    ],
    certifications: ["FSSAI"]
  },
  {
    id: 11,
    name: "Black Pepper (Kali Mirch)",
    name_hi: "काली मिर्च",
    price: 120,
    image: blackpepper_1,
    images: [ blackpepper_1, blackpepper_1_1 ],
    category: "Spices",
    variants: [ { id: "v11a", label: "100 g", price: 120 }, { id: "v11b", label: "200 g", price: 220 }, { id: "v11c", label: "500 g", price: 500 } ],
    description: "Grown in the Malabar coast, these peppercorns are sun-dried and graded for maximum Piperine content, which provides the real heat.",
    description_hi: "मालाबार तट से प्राप्त, ये काली मिर्च धूप में सुखाई गई हैं और असली तीखेपन (पाइपरिन) के लिए प्रसिद्ध हैं।",
    usage: "Crush fresh for omelets, pastas, and traditional Indian Kadha.",
    usage_hi: "आमलेट, पास्ता और पारंपरिक काढ़े के लिए ताजा पीसकर उपयोग करें।",
    storage: "Keep away from moisture.",
    manufacturer: "Madhuban Spices",
    origin: "Kerala, India",
    shelfLife: "18 Months",
    culinaryProfile: "Hot, spicy, and woody.",
    ingredients: ["Whole Black Peppercorns"],
    healthBenefits: [
      "Enhances nutrient absorption (especially Curcumin)",
      "Improves brain function and cognitive health",
      "Stimulates hydrochloric acid in the stomach for digestion",
      "Rich in Manganese and Vitamin K"
    ],
    healthBenefits_hi: [
      "पोषक तत्वों (विशेषकर हल्दी) के अवशोषण को बढ़ाता है",
      "मस्तिष्क कार्यप्रणाली और मानसिक स्वास्थ्य में सुधार",
      "पाचन के लिए पेट में एसिड को उत्तेजित करता है",
      "मैंगनीज और विटामिन K का अच्छा स्रोत"
    ],
    certifications: ["FSSAI"]
  },
  {
    id: 12,
    name: "Coriander Seeds (Dhaniya)",
    name_hi: "साबुत धनिया",
    price: 50,
    image: coriander_1,
    images: [ coriander_1, coriander_1_1 ],
    category: "Spices",
    variants: [ { id: "v12a", label: "100 g", price: 50 }, { id: "v12b", label: "250 g", price: 100 }, { id: "v12c", label: "500 g", price: 140 } ],
    description: "Lush green coriander seeds with a distinct citrusy notes. Sourced from the fields of Madhya Pradesh, perfect for home-ground masalas.",
    description_hi: "मध्य प्रदेश के खेतों से प्राप्त, विशेष खट्टेपन वाली खुशबू वाले धनिया बीज। घर में बने मसालों के लिए उत्तम।",
    usage: "Dry roast and grind for Sambar powder, Garam Masala, or use in 'Kadhai' dishes.",
    usage_hi: "सांभर पाउडर, गरम मसाला या 'कढ़ाई' व्यंजनों के लिए भूनकर पीसें।",
    storage: "Store in a cool, dry place.",
    manufacturer: "Madhuban Spices",
    origin: "Madhya Pradesh, India",
    shelfLife: "12 Months",
    culinaryProfile: "Citrusy, light, and sweet.",
    ingredients: ["100% Whole Coriander Seeds"],
    healthBenefits: [
      "Natural diuretic that helps reduce water retention",
      "Excellent for cooling the body in summers",
      "Helps regulate menstrual flow and symptoms",
      "Improves hair growth by strengthening roots"
    ],
    healthBenefits_hi: [
      "प्राकृतिक मूत्रवर्धक जो शरीर की सूजन कम करता है",
      "गर्मियों में शरीर को ठंडा रखने के लिए बेहतरीन",
      "मासिक धर्म चक्र को विनियमित करने में सहायक",
      "जड़ों को मजबूत कर बालों के विकास में सुधार"
    ],
    certifications: ["FSSAI"]
  },
  {
    id: 13,
    name: "Fenugreek Seeds (Methi)",
    name_hi: "मेथी दाना",
    price: 40,
    image: fenugreek_1,
    images: [ fenugreek_1, fenugreek_1 ],
    category: "Spices",
    variants: [ { id: "v13a", label: "50 g", price: 40 }, { id: "v13b", label: "100 g", price: 75 }, { id: "v13c", label: "250 g", price: 110 } ],
    description: "High-quality bitter-sweet Methi seeds. Essential for the classic Indian tempering and pickling.",
    description_hi: "उच्च गुणवत्ता वाले खट्टे-मीठे मेथी के बीज। भारतीय तड़के और अचार बनाने के लिए अनिवार्य।",
    usage: "Tempering for Kadhi, pickles, and soaked 'Methi water' for health.",
    usage_hi: "कढ़ी, अचार के तड़के और स्वास्थ्य के लिए भिगोए हुए 'मेथी पानी' के रूप में।",
    storage: "Keep in a dry airtight container.",
    storage_hi: "ठंडी और सूखी जगह पर सील बंद रखें।",
    manufacturer: "Madhuban Spices",
    origin: "Rajasthan, India",
    shelfLife: "12 Months",
    culinaryProfile: "Bitter, nutty, and maple-like aroma when roasted.",
    ingredients: ["100% Whole Fenugreek Seeds"],
    healthBenefits: [
      "Proven to help manage blood sugar (diabetes control)",
      "Excellent for lactating mothers to boost milk production",
      "Reduces heartburn and acid reflux",
      "Traditional remedy for dandruff and hair loss"
    ],
    healthBenefits_hi: [
      "ब्लड शुगर (मधुमेह) को नियंत्रित करने में सिद्ध",
      "स्तनपान कराने वाली माताओं में दूध उत्पादन बढ़ाने के लिए उत्तम",
      "सीने की जलन और एसिड रिफ्लक्स को कम करता है",
      "डैंड्रफ और बालों के झड़ने के लिए पारंपरिक उपचार"
    ],
    certifications: ["FSSAI"]
  },
  {
    id: 14,
    name: "Cloves (Laung)",
    name_hi: "लौंग",
    price: 120,
    image: cloves_1,
    images: [ cloves_1, cloves_1 ],
    category: "Spices",
    variants: [ { id: "v14a", label: "25 g", price: 120 }, { id: "v14b", label: "50 g", price: 190 }, { id: "v14c", label: "100 g", price: 300 } ],
    description: "Large, full-headed cloves with high volatile oil content. Hand-sorted to remove stems and dust.",
    description_hi: "उच्च तेल सामग्री वाली बड़ी और साबुत लौंग। डंठल और धूल हटाने के लिए हाथ से चुनी गई।",
    usage: "Whole in Biryani, crushed in tea, or for toothache relief.",
    usage_hi: "बिरयानी में साबुत, चाय में कुचलकर या दांत दर्द में राहत के लिए।",
    storage: "Store in a cool, dry place away from heat.",
    manufacturer: "Madhuban Spices",
    origin: "Kerala/Tamil Nadu, India",
    shelfLife: "18 Months",
    culinaryProfile: "Intense, medicinal, and sweet-warm.",
    ingredients: ["100% Whole Cloves"],
    healthBenefits: [
      "Contains Eugenol, a natural anesthetic for dental pain",
      "High concentration of antioxidants",
      "Improves liver health and bone density",
      "Helps clear congestion and sore throat"
    ],
    healthBenefits_hi: [
      "दांत दर्द के लिए प्राकृतिक एनेस्थेटिक (यूजेनॉल) युक्त",
      "एंटीऑक्सीडेंट का उच्च सांद्रण",
      "लिवर स्वास्थ्य और हड्डियों की मजबूती में सुधार",
      "कफ और गले की खराश दूर करने में सहायक"
    ],
    certifications: ["FSSAI"]
  },
  {
    id: 15,
    name: "Bay Leaves (Tej Patta)",
    name_hi: "तेज पत्ता",
    price: 40,
    image: bay_1,
    images: [ bay_1, bay_2 ],
    category: "Spices",
    variants: [ { id: "v15a", label: "10 g", price: 40 }, { id: "v15b", label: "25 g", price: 80 }, { id: "v15c", label: "50 g", price: 90 } ],
    description: "Selected dried Bay leaves from the Himalayan foothills. Greenish-olive in color, these leaves offer a subtle fragrance that deepens over slow cooking.",
    description_hi: "हिमालय की तराई से प्राप्त सूखे तेज पत्ते। इनका हल्का सुगंधित स्वाद धीमी आंच पर पकने वाले व्यंजनों में निखरता है।",
    usage: "Essential for Biryanis, Pulao, and slow-cooked curries.",
    usage_hi: "बिरयानी, पुलाव और धीरे पकने वाली करी के लिए अनिवार्य।",
    storage: "Store in an airtight container to prevent brittle leaves.",
    manufacturer: "Madhuban Spices",
    origin: "Uttarakhand/North East India",
    shelfLife: "12 Months",
    culinaryProfile: "Herbal, balsamic, and floral.",
    ingredients: ["100% Dried Bay Leaves"],
    healthBenefits: [
      "Helps lower blood sugar levels",
      "Enzymes aid in the breakdown of proteins for digestion",
      "Anti-fungal and anti-inflammatory properties",
      "Traditional remedy for stress and anxiety"
    ],
    healthBenefits_hi: [
      "ब्लड शुगर लेवल कम करने में सहायक",
      "पाचन के लिए प्रोटीन तोड़ने में मदद करने वाले एंजाइम युक्त",
      "एंटी-फंगल और सूजन-रोधी गुण",
      "तनाव और चिंता के लिए पारंपरिक उपचार"
    ],
    certifications: ["FSSAI"]
  },
  {
    id: 16,
    name: "Fennel Seeds (Saunf)",
    name_hi: "सौंफ",
    price: 40,
    image: fennel_1,
    images: [ fennel_1, fennel_1 ],
    category: "Spices",
    variants: [ { id: "v16a", label: "50 g", price: 40 }, { id: "v16b", label: "100 g", price: 80 }, { id: "v16c", label: "250 g", price: 130 } ],
    description: "Sweet, thin, and intensely aromatic Lucknowi Saunf. Perfectly sun-dried to maintain its vibrant green color and digestive oils.",
    description_hi: "मीठी, पतली और अत्यधिक सुगंधित लखनवी सौंफ। इसके हरे रंग और पाचन तेलों को बनाए रखने के लिए धूप में सुखाई गई।",
    usage: "After-meal digestive, Mukhwas, and flavoring tea.",
    usage_hi: "भोजन के बाद पाचक के रूप में, मुखवास और चाय के लिए।",
    storage: "Keep in a cool dry place to maintain crunch.",
    manufacturer: "Madhuban Spices",
    origin: "Uttar Pradesh, India",
    shelfLife: "12 Months",
    culinaryProfile: "Sweet, menthol-like, and refreshing.",
    ingredients: ["100% Pure Fennel Seeds"],
    healthBenefits: [
      "Relieves bloating, gas, and indigestion",
      "Purifies blood and regulates blood pressure",
      "Helps in improving eyesight (traditional belief)",
      "Excellent for freshening breath and oral hygiene"
    ],
    healthBenefits_hi: [
      "पेट फूलना, गैस और अपच से राहत",
      "रक्त को शुद्ध करता है और ब्लड प्रेशर नियंत्रित करता है",
      "आंखों की रोशनी सुधारने में सहायक (पारंपरिक मान्यता)",
      "सांसों की ताजगी और ओरल हाइजीन के लिए उत्तम"
    ],
    certifications: ["FSSAI"]
  },
  {
    id: 17,
    name: "Saffron (Kesar)",
    name_hi: "केसर",
    price: 250,
    image: saffron_1,
    images: [ saffron_1, saffron_2 ],
    category: "Spices",
    variants: [ { id: "v17a", label: "0.25 g", price: 250 }, { id: "v17b", label: "0.5 g", price: 500 }, { id: "v17c", label: "1 g", price: 950 } ],
    description: "World-class Grade A++ Mongra Saffron from Pampore, Kashmir. Deep red stigmas only, providing rich color, aroma, and therapeutic value.",
    description_hi: "कश्मीर के पंपोर से प्राप्त विश्व स्तरीय ग्रेड A++ मोंगरा केसर। बेहतरीन रंग और औषधीय गुणों के लिए केवल गहरे लाल धागे।",
    usage: "Garnish for Kheer, Biryani, or drink with warm milk at night.",
    usage_hi: "खीर, बिरयानी की सजावट या रात को गुनगुने दूध के साथ।",
    storage: "Store in a cool dark place; do not refrigerate.",
    manufacturer: "Madhuban Spices",
    origin: "Kashmir, India",
    shelfLife: "24 Months",
    culinaryProfile: "Floral, honeyed, and royal.",
    ingredients: ["100% Pure Saffron Stigmas"],
    healthBenefits: [
      "Natural mood booster and antidepressant properties",
      "Rich in Crocin which improves memory and brain health",
      "Supports skin health and natural glow",
      "Traditionally used during pregnancy for wellness"
    ],
    healthBenefits_hi: [
      "प्राकृतिक मूड बूस्टर और एंटी-डिप्रेसेंट",
      "क्रॉसिन से भरपूर जो याददाश्त और दिमाग को तेज करता है",
      "त्वचा के स्वास्थ्य और प्राकृतिक चमक में सहायक",
      "गर्भावस्था के दौरान स्वास्थ्य के लिए पारंपरिक रूप से उपयोग"
    ],
    certifications: ["Organic", "FSSAI"]
  },
  {
    id: 18,
    name: "Red Chilli Powder(Lal Mirch)",
    name_hi: "लाल मिर्च पाउडर",
    price: 85,
    image: chilli_1,
    images: [ chilli_1, chilli_2 ],
    category: "Spices",
    variants: [ { id: "v18a", label: "100 g", price: 85 }, { id: "v18b", label: "200 g", price: 150 }, { id: "v18c", label: "500 g", price: 350 } ],
    description: "Pure red chilli powder with a balance of heat and color. Sourced from Guntur, Andhra Pradesh. Free from added colors or oils.",
    description_hi: "तीखेपन और रंग का सही संतुलन। आंध्र प्रदेश के गुंटूर से प्राप्त। बिना किसी मिलावटी रंग या तेल के।",
    usage: "Daily cooking, marinades, and spicy chutneys.",
    usage_hi: "रोजाना खाना पकाने, मैरिनेशन और तीखी चटनी के लिए।",
    storage: "Store in a dry place. Wash hands after use.",
    manufacturer: "Madhuban Spices",
    origin: "Andhra Pradesh, India",
    shelfLife: "12 Months",
    culinaryProfile: "Pungent, hot, and vibrant red.",
    ingredients: ["100% Ground Red Chillies"],
    healthBenefits: [
      "Capsaicin helps boost metabolism and burn fat",
      "Rich in Vitamin C for immunity",
      "Helps clear congestion and sinus issues",
      "Supports cardiovascular health by improving circulation"
    ],
    healthBenefits_hi: [
      "कैप्साइसिन मेटाबॉलिज्म और वजन घटाने में सहायक",
      "इम्युनिटी के लिए विटामिन सी से भरपूर",
      "साइनस और बंद नाक खोलने में मदद करता है",
      "रक्त संचार सुधारकर हृदय स्वास्थ्य का समर्थन"
    ],
    certifications: ["FSSAI"]
  }
]

export default products
