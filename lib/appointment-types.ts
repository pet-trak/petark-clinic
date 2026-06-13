// lib/appointment-types.ts

export const APPOINTMENT_TYPES = [
    // General
    "consultation",
    "followUp",
    "teleConsultation",

    // Preventive Care
    "vaccination",
    "deworming",
    "parasiteControl",
    "healthScreening",
    "nutritionConsultation",

    // Diagnostics
    "diagnostics",
    "laboratoryTest",
    "bloodTest",
    "urinalysis",
    "xRay",
    "ultrasound",

    // Treatment
    "medicalTreatment",
    "woundCare",
    "dentalCare",
    "nailTrimming",

    // Surgery
    "surgery",
    "minorSurgery",
    "majorSurgery",
    "spayNeuter",

    // Emergency
    "emergency",
    "traumaCare",
    "poisoningTreatment",
    "intensiveCare",

    // Livestock
    "livestockVisit",
    "herdHealth",
    "pregnancyDiagnosis",
    "artificialInsemination",
    "farmVisit",
    "diseaseControl",

    // Other
    "grooming",
    "boarding",
    "homeVisit",
    "euthanasia",
    "postMortem",
] as const;

export type AppointmentType = (typeof APPOINTMENT_TYPES)[number];

// Human-readable labels for display in selects / UI
export const APPOINTMENT_TYPE_LABELS: Record<AppointmentType, string> = {
    consultation:            "Consultation",
    followUp:                "Follow-up",
    teleConsultation:        "Tele-consultation",
    vaccination:             "Vaccination",
    deworming:               "Deworming",
    parasiteControl:         "Parasite Control",
    healthScreening:         "Health Screening",
    nutritionConsultation:   "Nutrition Consultation",
    diagnostics:             "Diagnostics",
    laboratoryTest:          "Laboratory Test",
    bloodTest:               "Blood Test",
    urinalysis:              "Urinalysis",
    xRay:                    "X-Ray",
    ultrasound:              "Ultrasound",
    medicalTreatment:        "Medical Treatment",
    woundCare:               "Wound Care",
    dentalCare:              "Dental Care",
    nailTrimming:            "Nail Trimming",
    surgery:                 "Surgery",
    minorSurgery:            "Minor Surgery",
    majorSurgery:            "Major Surgery",
    spayNeuter:              "Spay / Neuter",
    emergency:               "Emergency",
    traumaCare:              "Trauma Care",
    poisoningTreatment:      "Poisoning Treatment",
    intensiveCare:           "Intensive Care",
    livestockVisit:          "Livestock Visit",
    herdHealth:              "Herd Health",
    pregnancyDiagnosis:      "Pregnancy Diagnosis",
    artificialInsemination:  "Artificial Insemination",
    farmVisit:               "Farm Visit",
    diseaseControl:          "Disease Control",
    grooming:                "Grooming",
    boarding:                "Boarding",
    homeVisit:               "Home Visit",
    euthanasia:              "Euthanasia",
    postMortem:              "Post Mortem",
};

// Grouped for rendering optgroup sections in a select
export const APPOINTMENT_TYPE_GROUPS: { label: string; types: AppointmentType[] }[] = [
    {
        label: "General",
        types: ["consultation", "followUp", "teleConsultation"],
    },
    {
        label: "Preventive Care",
        types: ["vaccination", "deworming", "parasiteControl", "healthScreening", "nutritionConsultation"],
    },
    {
        label: "Diagnostics",
        types: ["diagnostics", "laboratoryTest", "bloodTest", "urinalysis", "xRay", "ultrasound"],
    },
    {
        label: "Treatment",
        types: ["medicalTreatment", "woundCare", "dentalCare", "nailTrimming"],
    },
    {
        label: "Surgery",
        types: ["surgery", "minorSurgery", "majorSurgery", "spayNeuter"],
    },
    {
        label: "Emergency",
        types: ["emergency", "traumaCare", "poisoningTreatment", "intensiveCare"],
    },
    {
        label: "Livestock",
        types: ["livestockVisit", "herdHealth", "pregnancyDiagnosis", "artificialInsemination", "farmVisit", "diseaseControl"],
    },
    {
        label: "Other",
        types: ["grooming", "boarding", "homeVisit", "euthanasia", "postMortem"],
    },
];