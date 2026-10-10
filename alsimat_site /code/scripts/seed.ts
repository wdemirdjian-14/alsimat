import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Compte administrateur : défini via les variables d'environnement
  // ADMIN_EMAIL, ADMIN_PASSWORD (et optionnellement ADMIN_NAME).
  // Aucun mot de passe n'est stocké en dur dans le code.
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminName = process.env.ADMIN_NAME || "Administrateur";

  if (adminEmail && adminPassword) {
    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    await prisma.user.upsert({
      where: { email: adminEmail },
      update: { hashedPassword, name: adminName, role: "admin" },
      create: {
        email: adminEmail,
        hashedPassword,
        name: adminName,
        role: "admin",
      },
    });
  } else {
    console.log("ADMIN_EMAIL / ADMIN_PASSWORD non définis : aucun compte admin créé ou modifié.");
  }
  console.log("Admin users seeded.");

  // Categories
  const categories = [
    {
      id: "cat-tracteurs",
      name: "Tracteurs électriques",
      slug: "tracteurs-electriques",
      description: "100 % électrique pour plus d'efficacité, de fiabilité et d'économie. Le meilleur de la technologie pour des performances & une fiabilité inégalées.",
      image: "https://cdn.abacus.ai/images/d459861b-3369-43eb-aa3a-a1354f070d81.png",
      order: 1,
    },
    {
      id: "cat-nacelles",
      name: "Nacelles tractables",
      slug: "nacelles-tractables",
      description: "La nacelle tractable est un produit intermédiaire entre toutes les nacelles. Immatriculable ou pas, électrique, ces matériels allant de 7 à 25m de hauteur sont tous montés sur des remorques légères.",
      image: "https://cdn.abacus.ai/images/cb86aa0b-a9f9-4319-bbcb-c918265b27fa.png",
      order: 2,
    },
    {
      id: "cat-tricycle",
      name: "Tricycle électrique",
      slug: "tricycle-electrique",
      description: "Ce petit matériel est le moyen de déplacement professionnel de plus en plus recherché dans les industries. Compact et maniable, il est idéal pour les déplacements fréquents.",
      image: "https://cdn.abacus.ai/images/72a44586-8093-478c-9fb6-ab2ebcd14c85.png",
      order: 3,
    },
    {
      id: "cat-nacelles-agricole",
      name: "Nacelles sur tracteur agricole",
      slug: "nacelles-tracteur-agricole",
      description: "À propos de Thomas Hoogwerkers. Qualité - Simplicité - Sécurité. Une construction hydraulique robuste et fiable pour l'entretien agricole.",
      image: "https://cdn.abacus.ai/images/d8ebb630-a447-43f7-9c8e-add80ce0e6be.png",
      order: 4,
    },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.description, image: cat.image, order: cat.order },
      create: cat,
    });
  }

  // Vehicles
  const vehicles = [
    {
      id: "veh-tracteur-4x4",
      name: "Le tracteur industriel 4x4",
      slug: "tracteur-industriel-4x4",
      shortDescription: "Le véhicule LITTLE en option 4x4 équipé de sa cabine confort, d'un bac aluminium arrière et d'un crochet.",
      description: "Le tracteur industriel 4x4 EBOX est conçu pour les environnements exigeants. Équipé de 2 moteurs électriques de 4kw chacun, il offre des performances inégalées en mode tout-terrain.\n\nSa cabine confort assure une protection optimale pour l'opérateur. Les batteries plomb-pur ne nécessitent aucun entretien et offrent une autonomie d'une journée complète.\n\nHomologué route, ce véhicule peut circuler sur la voie publique sans permis spécial.",
      price: "Sur devis",
      characteristics: {
        "Motorisation": "2x4 kW électrique",
        "Transmission": "4x4",
        "Batterie": "Plomb-pur ou Lithium",
        "Autonomie": "Journée complète",
        "Vitesse max": "25 km/h",
        "Charge utile": "500 kg",
        "Homologation": "Route européenne",
        "Fabrication": "France (Loiret)",
      },
      images: [
        "https://cdn.abacus.ai/images/4547d052-b898-46db-8c85-51322dfd7749.png",
      ],
      featured: true,
      categoryIds: ["cat-tracteurs"],
    },
    {
      id: "veh-voirie",
      name: "Petit véhicule de voirie immatriculable",
      slug: "vehicule-voirie-immatriculable",
      shortDescription: "DÉCOUVREZ LE PLAISIR DE CIRCULER EN VÉHICULE ÉLECTRIQUE. Partagez ces nouvelles sensations avec nos véhicules.",
      description: "Ce petit véhicule de voirie électrique est immatriculable et permet de circuler sur la voie publique. Idéal pour les collectivités, les espaces verts et les zones piétonnes.\n\nSon design compact et sa maniabilité en font l'outil parfait pour l'entretien des espaces publics. Silencieux et écologique, il s'intègre parfaitement dans les environnements urbains.",
      price: "Sur devis",
      characteristics: {
        "Motorisation": "4 kW électrique",
        "Batterie": "Plomb-pur",
        "Autonomie": "8 heures",
        "Vitesse max": "25 km/h",
        "Immatriculation": "Oui",
        "Entretien": "Réduit - 12€ la recharge",
      },
      images: [
        "https://cdn.abacus.ai/images/95286503-1a8f-4e44-9d26-5791afce3001.png",
      ],
      featured: true,
      categoryIds: ["cat-tracteurs"],
    },
    {
      id: "veh-transport-personnel",
      name: "Véhicule transport personnel",
      slug: "vehicule-transport-personnel",
      shortDescription: "Le 1er 4X4 ÉLECTRIQUE 6 PLACES ! Et maintenant en 8 PLACES. Transportez désormais 6 ou 8 personnes confortablement.",
      description: "Ce véhicule de transport de personnel électrique est disponible en version 6 ou 8 places. Idéal pour les grands sites industriels, les parcs de loisirs, les hôpitaux et les aéroports.\n\nSon confort et sa capacité en font la solution parfaite pour le transport de groupes dans les environnements où le silence et l'absence de pollution sont essentiels.",
      price: "Sur devis",
      characteristics: {
        "Capacité": "6 ou 8 places",
        "Motorisation": "4 kW électrique",
        "Batterie": "Plomb-pur ou Lithium",
        "Autonomie": "Journée complète",
        "Vitesse max": "25 km/h",
        "Homologation": "Route",
      },
      images: [
        "https://cdn.abacus.ai/images/35083ee3-c53e-48b3-9966-cbe9a296f33b.png",
      ],
      featured: false,
      categoryIds: ["cat-tracteurs"],
    },
    {
      id: "veh-transport-marchandises",
      name: "Véhicule de transport de marchandises",
      slug: "vehicule-transport-marchandises",
      shortDescription: "BÂCHES POUR BENNES GALVANISÉES. L'accessoire idéal pour votre benne. Protège des intempéries et sécurise le chargement.",
      description: "Le véhicule de transport de marchandises électrique est équipé d'un plateau galvanisé robuste, idéal pour le transport de charges lourdes sur de courtes distances.\n\nÉquipé en option de bâches et de ridelles, il assure la sécurité et la protection de vos marchandises.",
      price: "Sur devis",
      characteristics: {
        "Charge utile": "1000 kg",
        "Motorisation": "4 kW électrique",
        "Batterie": "Plomb-pur",
        "Plateau": "Galvanisé",
        "Options": "Bâches, ridelles",
      },
      images: [
        "https://cdn.abacus.ai/images/17917ceb-5094-46d0-9d65-c6614f73e283.png",
      ],
      featured: false,
      categoryIds: ["cat-tracteurs"],
    },
    {
      id: "veh-entretien-jardin",
      name: "Véhicule entretien de jardin",
      slug: "vehicule-entretien-jardin",
      shortDescription: "BENNE DIMENSIONS STANDARD. L'outil idéal pour un usage couvert. En Acier et habillage extérieur en plastique.",
      description: "Ce véhicule d'entretien de jardin électrique est spécialement conçu pour les travaux de jardinage et d'aménagement paysager.\n\nCompact et maniable, il accède facilement aux espaces restreints tout en offrant une capacité de charge suffisante pour vos outils et matériaux.",
      price: "Sur devis",
      characteristics: {
        "Usage": "Jardinage / Paysage",
        "Motorisation": "Électrique",
        "Batterie": "Plomb-pur",
        "Benne": "Acier avec habillage plastique",
        "Dimensions": "Standard",
      },
      images: [
        "https://cdn.abacus.ai/images/272e2622-c2bf-4129-9ac9-8ec149cfa65f.png",
      ],
      featured: false,
      categoryIds: ["cat-tracteurs"],
    },
    {
      id: "veh-nacelle-tractable",
      name: "Nacelle tractable 12m",
      slug: "nacelle-tractable-12m",
      shortDescription: "Nacelle élévatrice tractable électrique, hauteur de travail 12m, légère et maniable.",
      description: "Cette nacelle tractable électrique offre une hauteur de travail de 12 mètres. Montée sur une remorque légère, elle peut être tractée par un véhicule léger ou un fourgon.\n\nSa simplicité d'utilisation ne nécessite aucune connaissance particulière. Elle s'adapte à tous les besoins : entretien de bâtiments, élagage, travaux électriques, etc.",
      price: "Sur devis",
      characteristics: {
        "Hauteur de travail": "12 m",
        "Énergie": "Électrique",
        "Support": "Remorque tractable",
        "Poids": "Léger",
        "Utilisation": "Simple, sans formation spéciale",
      },
      images: [
        "https://cdn.abacus.ai/images/cb86aa0b-a9f9-4319-bbcb-c918265b27fa.png",
      ],
      featured: true,
      categoryIds: ["cat-nacelles"],
    },
    {
      id: "veh-tricycle",
      name: "Tricycle électrique professionnel",
      slug: "tricycle-electrique-professionnel",
      shortDescription: "Moyen de déplacement professionnel compact et silencieux, idéal pour les sites industriels.",
      description: "Le tricycle électrique professionnel est un moyen de déplacement compact et écologique. Idéal pour les déplacements fréquents sur les sites industriels, les entrepôts et les campus.\n\nSa maniabilité et sa compacité lui permettent de circuler dans les espaces les plus étroits.",
      price: "Sur devis",
      characteristics: {
        "Type": "Tricycle électrique",
        "Usage": "Déplacement professionnel",
        "Batterie": "Électrique",
        "Avantages": "Compact, silencieux, écologique",
      },
      images: [
        "https://cdn.abacus.ai/images/72a44586-8093-478c-9fb6-ab2ebcd14c85.png",
      ],
      featured: true,
      categoryIds: ["cat-tricycle"],
    },
    {
      id: "veh-nacelle-agricole",
      name: "Nacelle sur tracteur agricole",
      slug: "nacelle-tracteur-agricole-thomas",
      shortDescription: "Nacelle hydraulique montée sur tracteur agricole, qualité Thomas Hoogwerkers.",
      description: "La nacelle sur tracteur agricole Thomas Hoogwerkers est une solution robuste et fiable pour les travaux en hauteur dans le domaine agricole.\n\nMontée sur l'attelage 3 points du tracteur, elle s'installe et se désinstalle rapidement. Sa construction hydraulique garantit une sécurité et une fiabilité optimales.",
      price: "Sur devis",
      characteristics: {
        "Montage": "Attelage 3 points tracteur",
        "Énergie": "Hydraulique (prise de force)",
        "Constructeur": "Thomas Hoogwerkers",
        "Qualité": "Européenne",
        "Installation": "Rapide",
      },
      images: [
        "https://cdn.abacus.ai/images/d8ebb630-a447-43f7-9c8e-add80ce0e6be.png",
      ],
      featured: true,
      categoryIds: ["cat-nacelles-agricole"],
    },
  ];

  for (const veh of vehicles) {
    const { categoryIds, ...vehicleData } = veh;
    await prisma.vehicle.upsert({
      where: { slug: vehicleData.slug },
      update: {
        name: vehicleData.name,
        shortDescription: vehicleData.shortDescription,
        description: vehicleData.description,
        price: vehicleData.price,
        characteristics: vehicleData.characteristics,
        images: vehicleData.images,
        featured: vehicleData.featured,
      },
      create: vehicleData,
    });

    // Create vehicle-category relations
    for (const catId of categoryIds) {
      const vehicle = await prisma.vehicle.findUnique({ where: { slug: vehicleData.slug } });
      if (vehicle) {
        await prisma.vehicleCategory.upsert({
          where: {
            vehicleId_categoryId: {
              vehicleId: vehicle.id,
              categoryId: catId,
            },
          },
          update: {},
          create: {
            vehicleId: vehicle.id,
            categoryId: catId,
          },
        });
      }
    }
  }

  // Projects / Realisations
  const projects = [
    {
      id: "proj-hopital",
      title: "Flotte électrique pour centre hospitalier",
      description: "Livraison et mise en service d'une flotte de véhicules électriques pour le transport de personnel et de matériel au sein d'un grand centre hospitalier. Les véhicules silencieux et non polluants s'intègrent parfaitement dans l'environnement hospitalier.",
      image: "https://cdn.abacus.ai/images/7bf95f7b-1bb5-4748-a314-ba71ae3e8966.png",
      date: "2024",
    },
    {
      id: "proj-parc",
      title: "Entretien des espaces verts municipaux",
      description: "Fourniture de véhicules d'entretien électriques pour la municipalité. Ces véhicules permettent un entretien silencieux et écologique des parcs et jardins publics, respectant la tranquillité des promeneurs.",
      image: "https://cdn.abacus.ai/images/42ef460c-10f0-4855-9148-5464f7c9ecde.png",
      date: "2023",
    },
    {
      id: "proj-batiment",
      title: "Maintenance de bâtiments industriels",
      description: "Installation de nacelles tractables pour la maintenance régulière de bâtiments industriels. La solution complète comprend formation du personnel et suivi technique.",
      image: "https://cdn.abacus.ai/images/5aa0d271-5a2b-4086-a413-89f1b1e5a74f.png",
      date: "2023",
    },
  ];

  for (const proj of projects) {
    await prisma.project.upsert({
      where: { id: proj.id },
      update: { title: proj.title, description: proj.description, image: proj.image, date: proj.date },
      create: proj,
    });
  }

  console.log("Seeding complete!");
}

main()
  .catch((e: any) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
