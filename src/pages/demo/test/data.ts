export interface TestItem {
  id: number;
  facetId: number;
  dich: "EI" | "SN" | "TF" | "JP";
  textES: string;
  textEN: string;
  key: "D" | "I";
}

export interface FacetDef {
  id: number;
  dich: "EI" | "SN" | "TF" | "JP";
  themeES: string;
  themeEN: string;
  leftNameES: string;
  leftNameEN: string;
  leftDescES: string;
  leftDescEN: string;
  rightNameES: string;
  rightNameEN: string;
  rightDescES: string;
  rightDescEN: string;
  items: TestItem[];
}

export interface DichotomyDef {
  code: "EI" | "SN" | "TF" | "JP";
  leftLetter: string;
  rightLetter: string;
  leftNameES: string;
  rightNameES: string;
  leftNameEN: string;
  rightNameEN: string;
  leftDescES: string;
  rightDescES: string;
  leftDescEN: string;
  rightDescEN: string;
}

export interface DecisionStyle {
  f11: "L" | "R" | "M";
  f12: "L" | "R" | "M";
  nameES: string;
  nameEN: string;
  descES: string;
  descEN: string;
}

export interface FunctionSet {
  dominant: string;
  auxiliary: string;
  tertiary: string;
  inferior: string;
}

export interface AppliedTableDef {
  key: string;
  titleES: string;
  titleEN: string;
  introES: string;
  introEN: string;
  facetIds: number[];
}

// =====================================================================
// Dichotomies
// =====================================================================
export const DICHOTOMIES: DichotomyDef[] = [
  {
    code: "EI",
    leftLetter: "E",
    rightLetter: "I",
    leftNameES: "Extraversión",
    rightNameES: "Introversión",
    leftNameEN: "Extraversion",
    rightNameEN: "Introversion",
    leftDescES: "Diriges la energía hacia el mundo exterior de personas y objetos.",
    rightDescES: "Diriges la energía hacia el mundo interior de experiencias e ideas.",
    leftDescEN: "You direct energy toward the outer world of people and things.",
    rightDescEN: "You direct energy toward the inner world of experiences and ideas.",
  },
  {
    code: "SN",
    leftLetter: "S",
    rightLetter: "N",
    leftNameES: "Sensación",
    rightNameES: "Intuición",
    leftNameEN: "Sensing",
    rightNameEN: "Intuition",
    leftDescES: "Atiendes a lo que puede percibirse con los cinco sentidos.",
    rightDescES: "Atiendes a patrones, relaciones y posibilidades.",
    leftDescEN: "You attend to what can be perceived through the five senses.",
    rightDescEN: "You attend to patterns, relationships and possibilities.",
  },
  {
    code: "TF",
    leftLetter: "T",
    rightLetter: "F",
    leftNameES: "Pensamiento",
    rightNameES: "Sentimiento",
    leftNameEN: "Thinking",
    rightNameEN: "Feeling",
    leftDescES: "Concluyes mediante análisis lógico, buscando objetividad.",
    rightDescES: "Concluyes mediante valores personales o sociales, buscando armonía.",
    leftDescEN: "You decide through logical analysis, seeking objectivity.",
    rightDescEN: "You decide through personal or social values, seeking harmony.",
  },
  {
    code: "JP",
    leftLetter: "J",
    rightLetter: "P",
    leftNameES: "Juicio",
    rightNameES: "Percepción",
    leftNameEN: "Judging",
    rightNameEN: "Perceiving",
    leftDescES: "Prefieres decidir y cerrar.",
    rightDescES: "Prefieres la flexibilidad y la espontaneidad.",
    leftDescEN: "You prefer to decide and close.",
    rightDescEN: "You prefer flexibility and spontaneity.",
  },
];

// =====================================================================
// Facets + Items
// =====================================================================
const facetTemplates: Omit<FacetDef, "items">[] = [
  // EI
  {
    id: 1, dich: "EI", themeES: "Formas de conectar con otros", themeEN: "Ways of connecting with others",
    leftNameES: "Iniciador", leftNameEN: "Initiator", leftDescES: "Sociable, cordial, presenta gente", leftDescEN: "Sociable, cordial, introduces people",
    rightNameES: "Receptivo", rightNameEN: "Receptive", rightDescES: "Reservado, discreto, espera a ser presentado", rightDescEN: "Reserved, discreet, waits to be introduced",
  },
  {
    id: 2, dich: "EI", themeES: "Comunicar sentimientos, pensamientos e intereses", themeEN: "Communicating feelings, thoughts and interests",
    leftNameES: "Expresivo", leftNameEN: "Expressive", leftDescES: "Demostrativo, fácil de conocer, se revela", leftDescEN: "Demonstrative, easy to know, self-revealing",
    rightNameES: "Contenido", rightNameEN: "Reserved", rightDescES: "Controlado, difícil de conocer, privado", rightDescEN: "Controlled, difficult to know, private",
  },
  {
    id: 3, dich: "EI", themeES: "Amplitud y profundidad de las relaciones", themeEN: "Breadth and depth of relationships",
    leftNameES: "Gregario", leftNameEN: "Group-oriented", leftDescES: "Círculo amplio, quiere pertenecer, se une a grupos", leftDescEN: "Wide circle, wants to belong, joins groups",
    rightNameES: "Íntimo", rightNameEN: "One-to-one", rightDescES: "Uno a uno, busca cercanía, elige individuos", rightDescEN: "One-to-one, seeks closeness, chooses individuals",
  },
  {
    id: 4, dich: "EI", themeES: "Formas de comunicar, convivir y aprender", themeEN: "Ways of communicating, socializing and learning",
    leftNameES: "Activo", leftNameEN: "Interactive", leftDescES: "Interactivo, busca contacto, escucha y habla", leftDescEN: "Interactive, seeks contact, listens and speaks",
    rightNameES: "Reflexivo", rightNameEN: "Reflective", rightDescES: "Observador, prefiere espacio, lee y escribe", rightDescEN: "Observant, prefers space, reads and writes",
  },
  {
    id: 5, dich: "EI", themeES: "Nivel y tipo de energía", themeEN: "Level and kind of energy",
    leftNameES: "Entusiasta", leftNameEN: "Enthusiastic", leftDescES: "Vivaz, enérgico, busca los reflectores", leftDescEN: "Lively, energetic, seeks the spotlight",
    rightNameES: "Sereno", rightNameEN: "Low-key", rightDescES: "Calmado, disfruta la soledad, busca el segundo plano", rightDescEN: "Calm, enjoys solitude, seeks the background",
  },
  // SN
  {
    id: 6, dich: "SN", themeES: "Foco de atención", themeEN: "Focus of attention",
    leftNameES: "Concreto", leftNameEN: "Concrete", leftDescES: "Hechos exactos, literal, tangible", leftDescEN: "Exact facts, literal, tangible",
    rightNameES: "Abstracto", rightNameEN: "Figurative", rightDescES: "Figurado, simbólico, intangible", rightDescEN: "Figurative, symbolic, intangible",
  },
  {
    id: 7, dich: "SN", themeES: "Cómo se usa la información", themeEN: "How information is used",
    leftNameES: "Realista", leftNameEN: "Realistic", leftDescES: "Sensato, práctico, busca eficiencia", leftDescEN: "Sensible, practical, seeks efficiency",
    rightNameES: "Imaginativo", rightNameEN: "Inventive", rightDescES: "Ingenioso, inventivo, busca la novedad", rightDescEN: "Ingenious, inventive, seeks novelty",
  },
  {
    id: 8, dich: "SN", themeES: "Cómo se usan las ideas", themeEN: "How ideas are used",
    leftNameES: "Práctico", leftNameEN: "Applied", leftDescES: "Pragmático, orientado a resultados, aplicado", leftDescEN: "Pragmatic, results-oriented, applied",
    rightNameES: "Conceptual", rightNameEN: "Conceptual", rightDescES: "Erudito, orientado a las ideas, intelectual", rightDescEN: "Erudite, idea-oriented, intellectual",
  },
  {
    id: 9, dich: "SN", themeES: "Tipo de conocimiento en el que se confía", themeEN: "Kind of knowledge trusted",
    leftNameES: "Experiencial", leftNameEN: "Hands-on", leftDescES: "Manos a la obra, empírico, confía en la experiencia", leftDescEN: "Hands-on, empirical, trusts experience",
    rightNameES: "Teórico", rightNameEN: "Theoretical", rightDescES: "Busca patrones, hipotético, confía en las teorías", rightDescEN: "Seeks patterns, hypothetical, trusts theories",
  },
  {
    id: 10, dich: "SN", themeES: "Actitud ante lo establecido", themeEN: "Approach to what is established",
    leftNameES: "Tradicional", leftNameEN: "Conventional", leftDescES: "Convencional, acostumbrado, probado", leftDescEN: "Conventional, accustomed, proven",
    rightNameES: "Original", rightNameEN: "Original", rightDescES: "Poco convencional, distinto, nuevo e inusual", rightDescEN: "Unconventional, different, new and unusual",
  },
  // TF
  {
    id: 11, dich: "TF", themeES: "Enfoque ideal para decidir", themeEN: "Ideal approach to deciding",
    leftNameES: "Lógico", leftNameEN: "Logical", leftDescES: "Impersonal, busca imparcialidad, análisis objetivo", leftDescEN: "Impersonal, seeks impartiality, objective analysis",
    rightNameES: "Empático", rightNameEN: "Values-based", rightDescES: "Personal, busca armonía, valores centrales", rightDescEN: "Personal, seeks harmony, values-centered",
  },
  {
    id: 12, dich: "TF", themeES: "Método real de decisión", themeEN: "Actual method of deciding",
    leftNameES: "Razonable", leftNameEN: "Principled", leftDescES: "Veraz, causa y efecto, aplica principios", leftDescEN: "Truthful, cause and effect, applies principles",
    rightNameES: "Compasivo", rightNameEN: "Considerate", rightDescES: "Considerado, empático, leal", rightDescEN: "Considerate, empathetic, loyal",
  },
  {
    id: 13, dich: "TF", themeES: "Formas de manejar las diferencias", themeEN: "Ways of handling differences",
    leftNameES: "Cuestionador", leftNameEN: "Questioning", leftDescES: "Preciso, desafiante, quiere discutir el punto", leftDescEN: "Precise, challenging, wants to discuss the point",
    rightNameES: "Conciliador", rightNameEN: "Accommodating", rightDescES: "Aprobatorio, complaciente, quiere armonía", rightDescEN: "Approving, accommodating, wants harmony",
  },
  {
    id: 14, dich: "TF", themeES: "Comunicar los desacuerdos", themeEN: "Communicating disagreement",
    leftNameES: "Crítico", leftNameEN: "Critical", leftDescES: "Escéptico, pide pruebas, señala fallas", leftDescEN: "Skeptical, asks for proof, points out flaws",
    rightNameES: "Aceptante", rightNameEN: "Accepting", rightDescES: "Tolerante, confiado, reconoce méritos", rightDescEN: "Tolerant, trusting, recognizes merits",
  },
  {
    id: 15, dich: "TF", themeES: "Cómo se llevan a cabo las decisiones", themeEN: "How decisions are carried out",
    leftNameES: "Firme", leftNameEN: "Firm", leftDescES: "Decidido, orientado a los fines, no se dobla", leftDescEN: "Decisive, goal-oriented, does not bend",
    rightNameES: "Considerado", rightNameEN: "Gentle", rightDescES: "Suave, orientado a los medios, cuida a la gente", rightDescEN: "Gentle, process-oriented, cares about people",
  },
  // JP
  {
    id: 16, dich: "JP", themeES: "Estilo general de organización", themeEN: "General organizational style",
    leftNameES: "Sistemático", leftNameEN: "Structured", leftDescES: "Ordenado, estructurado, evita desviaciones", leftDescEN: "Orderly, structured, avoids deviations",
    rightNameES: "Informal", rightNameEN: "Casual", rightDescES: "Relajado, flexible, acepta desviaciones", rightDescEN: "Relaxed, flexible, accepts deviations",
  },
  {
    id: 17, dich: "JP", themeES: "Enfoque de la planeación", themeEN: "Approach to planning",
    leftNameES: "Planificador", leftNameEN: "Planner", leftDescES: "Planifica con anticipación, cierra planes", leftDescEN: "Plans ahead, settles plans",
    rightNameES: "Abierto", rightNameEN: "Open-ended", rightDescES: "Decide sobre la marcha, espontáneo", rightDescEN: "Decides as he goes, spontaneous",
  },
  {
    id: 18, dich: "JP", themeES: "Manejo de la presión del tiempo", themeEN: "Managing time pressure",
    leftNameES: "Arranque temprano", leftNameEN: "Early starter", leftDescES: "Empieza pronto, evita estrés de última hora", leftDescEN: "Starts early, avoids last-minute stress",
    rightNameES: "Impulsado por presión", rightNameEN: "Deadline-driven", rightDescES: "Rinde bajo presión, trabaja por rachas", rightDescEN: "Performs under pressure, works in bursts",
  },
  {
    id: 19, dich: "JP", themeES: "Uso de horarios y rutinas", themeEN: "Use of schedules and routines",
    leftNameES: "Programado", leftNameEN: "Scheduled", leftDescES: "Usa rutinas, listas, horarios definidos", leftDescEN: "Uses routines, lists, defined schedules",
    rightNameES: "Espontáneo", rightNameEN: "Spontaneous", rightDescES: "Busca variedad, las rutinas lo agotan", rightDescEN: "Seeks variety, routines wear him out",
  },
  {
    id: 20, dich: "JP", themeES: "Cómo se completan las tareas grandes", themeEN: "How large tasks get completed",
    leftNameES: "Metódico", leftNameEN: "Methodical", leftDescES: "Desglosa subtareas, sigue pasos definidos", leftDescEN: "Breaks out subtasks, follows defined steps",
    rightNameES: "Emergente", rightNameEN: "Emergent", rightDescES: "Se lanza, la estrategia aparece en el camino", rightDescEN: "Plunges in, strategy appears along the way",
  },
];

const rawItems: { facetId: number; dich: "EI" | "SN" | "TF" | "JP"; textES: string; textEN: string; key: "D" | "I" }[] = [
  // Facet 1
  { facetId: 1, dich: "EI", textES: "En una reunión donde casi no conozco a nadie, soy yo quien se acerca primero a presentarse.", textEN: "At a gathering where I barely know anyone, I am the one who walks up and introduces myself.", key: "D" },
  { facetId: 1, dich: "EI", textES: "Me resulta natural presentar a unas personas con otras para que se conozcan.", textEN: "Introducing people to each other comes naturally to me.", key: "D" },
  { facetId: 1, dich: "EI", textES: "Prefiero esperar a que alguien me hable antes de iniciar yo la conversación.", textEN: "I would rather wait for someone to speak to me than start the conversation myself.", key: "I" },
  { facetId: 1, dich: "EI", textES: "Cuando entro a un grupo nuevo tardo un buen rato en integrarme.", textEN: "When I join a new group it takes me a while to settle in.", key: "I" },
  { facetId: 1, dich: "EI", textES: "Suelo asumir el papel de anfitrión aunque el evento no sea mío.", textEN: "I tend to take the host's role even when the event isn't mine.", key: "D" },
  // Facet 2
  { facetId: 2, dich: "EI", textES: "Comparto con facilidad lo que siento, incluso con gente que apenas conozco.", textEN: "I share what I feel easily, even with people I hardly know.", key: "D" },
  { facetId: 2, dich: "EI", textES: "Hay una parte privada de mí que me cuesta mucho mostrar, incluso con personas cercanas.", textEN: "There is a private part of me that is very hard to show, even to people close to me.", key: "I" },
  { facetId: 2, dich: "EI", textES: "Pienso en voz alta: los demás se enteran de mis ideas mientras las voy formando.", textEN: "I think out loud: others hear my ideas while I am still forming them.", key: "D" },
  { facetId: 2, dich: "EI", textES: "Prefiero guardarme mis reacciones emocionales y procesarlas por mi cuenta.", textEN: "I keep my emotional reactions to myself and work through them alone.", key: "I" },
  { facetId: 2, dich: "EI", textES: "Me incomoda que una conversación derive hacia asuntos personales míos.", textEN: "It makes me uncomfortable when a conversation turns to personal matters of mine.", key: "I" },
  // Facet 3
  { facetId: 3, dich: "EI", textES: "Disfruto pertenecer a grupos amplios y tener un círculo social extenso.", textEN: "I enjoy belonging to large groups and having a wide social circle.", key: "D" },
  { facetId: 3, dich: "EI", textES: "Prefiero unas pocas relaciones profundas a muchas relaciones ligeras.", textEN: "I prefer a few deep relationships to many light ones.", key: "I" },
  { facetId: 3, dich: "EI", textES: "Me siento cómodo conviviendo con conocidos casuales.", textEN: "I am comfortable spending time with casual acquaintances.", key: "D" },
  { facetId: 3, dich: "EI", textES: "Las conversaciones uno a uno me dejan más satisfecho que las reuniones numerosas.", textEN: "One-to-one conversations leave me more satisfied than large gatherings.", key: "I" },
  { facetId: 3, dich: "EI", textES: "Me gusta sumarme a colectivos, clubes o comunidades.", textEN: "I like joining clubs, collectives or communities.", key: "D" },
  // Facet 4
  { facetId: 4, dich: "EI", textES: "Aprendo mejor conversando y haciendo que leyendo por mi cuenta.", textEN: "I learn better by talking and doing than by reading on my own.", key: "D" },
  { facetId: 4, dich: "EI", textES: "Necesito espacio y silencio para procesar información nueva.", textEN: "I need space and quiet to process new information.", key: "I" },
  { facetId: 4, dich: "EI", textES: "Prefiero dejar un asunto por escrito antes que resolverlo hablando.", textEN: "I would rather put a matter in writing than settle it by talking.", key: "I" },
  { facetId: 4, dich: "EI", textES: "En un evento disfruto más observar que participar activamente.", textEN: "At an event I enjoy watching more than taking part.", key: "I" },
  { facetId: 4, dich: "EI", textES: "Busco contacto e interacción a lo largo de todo el día.", textEN: "I look for contact and interaction throughout the day.", key: "D" },
  // Facet 5
  { facetId: 5, dich: "EI", textES: "Me gusta estar donde está la acción.", textEN: "I like being where the action is.", key: "D" },
  { facetId: 5, dich: "EI", textES: "Con frecuencia termino siendo el centro de atención.", textEN: "I often end up at the center of attention.", key: "D" },
  { facetId: 5, dich: "EI", textES: "Disfruto la calma y la soledad más que el bullicio.", textEN: "I enjoy calm and solitude more than commotion.", key: "I" },
  { facetId: 5, dich: "EI", textES: "Contagio mi entusiasmo a los demás.", textEN: "My enthusiasm spreads to other people.", key: "D" },
  { facetId: 5, dich: "EI", textES: "Prefiero mantenerme en segundo plano.", textEN: "I prefer to stay in the background.", key: "I" },
  // Facet 6
  { facetId: 6, dich: "SN", textES: "Me interesan más los hechos exactos que sus posibles significados.", textEN: "Exact facts interest me more than what they might mean.", key: "D" },
  { facetId: 6, dich: "SN", textES: "Cuando escucho un dato, de inmediato pienso qué podría significar más allá de lo literal.", textEN: "When I hear a fact I immediately wonder what else it could mean.", key: "I" },
  { facetId: 6, dich: "SN", textES: "Prefiero las descripciones literales y tangibles a las metáforas.", textEN: "I prefer literal, tangible descriptions to metaphors.", key: "D" },
  { facetId: 6, dich: "SN", textES: "Disfruto los símbolos, las analogías y el lenguaje figurado.", textEN: "I enjoy symbols, analogies and figurative language.", key: "I" },
  { facetId: 6, dich: "SN", textES: "Me quedo con lo que puede verificarse directamente.", textEN: "I stick to what can be verified directly.", key: "D" },
  // Facet 7
  { facetId: 7, dich: "SN", textES: "Antes que nada evalúo los costos reales de una idea.", textEN: "Before anything else I weigh the real costs of an idea.", key: "D" },
  { facetId: 7, dich: "SN", textES: "Disfruto buscar métodos nuevos e ingeniosos aunque ya haya uno que funcione.", textEN: "I enjoy looking for new methods even when the current one works.", key: "I" },
  { facetId: 7, dich: "SN", textES: "Soy sensato y realista al valorar una propuesta.", textEN: "I am sensible and down-to-earth when judging a proposal.", key: "D" },
  { facetId: 7, dich: "SN", textES: "Me atrae la novedad por sí misma.", textEN: "Novelty appeals to me for its own sake.", key: "I" },
  { facetId: 7, dich: "SN", textES: "Me atraen las ideas ingeniosas aunque todavía no sepa si son viables.", textEN: "Clever ideas attract me even before I know whether they are workable.", key: "I" },
  // Facet 8
  { facetId: 8, dich: "SN", textES: "Una idea me interesa sobre todo por lo que se puede hacer con ella.", textEN: "An idea interests me mainly for what can be done with it.", key: "D" },
  { facetId: 8, dich: "SN", textES: "Disfruto las ideas por sí mismas, aunque no tengan aplicación a la vista.", textEN: "I enjoy ideas in themselves, whether or not they have any application.", key: "I" },
  { facetId: 8, dich: "SN", textES: "Me impaciento con las discusiones que no llevan a una acción concreta.", textEN: "I get impatient with discussions that don't land on something concrete.", key: "D" },
  { facetId: 8, dich: "SN", textES: "Me atraen los temas intelectuales y académicos aunque no me sirvan para nada.", textEN: "Intellectual and academic subjects appeal to me even when they are of no use to me.", key: "I" },
  { facetId: 8, dich: "SN", textES: "Juzgo una propuesta por sus resultados aplicables.", textEN: "I judge a proposal by the results it can produce.", key: "D" },
  // Facet 9
  { facetId: 9, dich: "SN", textES: "Confío más en lo que he vivido que en lo que he leído.", textEN: "I trust what I have lived through more than what I have read.", key: "D" },
  { facetId: 9, dich: "SN", textES: "Necesito que me muestren cómo funciona algo antes de darlo por bueno.", textEN: "I need to be shown how something works before I accept it.", key: "D" },
  { facetId: 9, dich: "SN", textES: "Busco patrones y teorías que expliquen cómo se conecta todo.", textEN: "I look for patterns and theories that explain how everything connects.", key: "I" },
  { facetId: 9, dich: "SN", textES: "Me convence más un modelo bien construido que una anécdota bien contada.", textEN: "A well-built model convinces me more than a well-told anecdote.", key: "I" },
  { facetId: 9, dich: "SN", textES: "Me siento cómodo trabajando con hipótesis que todavía no he comprobado.", textEN: "I am comfortable working with hypotheses I have not yet verified.", key: "I" },
  // Facet 10
  { facetId: 10, dich: "SN", textES: "Si algo funciona desde hace años, no veo razón para cambiarlo.", textEN: "If something has worked for years, I see no reason to change it.", key: "D" },
  { facetId: 10, dich: "SN", textES: "Busco activamente formas distintas de hacer las cosas.", textEN: "I actively look for different ways of doing things.", key: "I" },
  { facetId: 10, dich: "SN", textES: "Me siento cómodo con las costumbres y los métodos establecidos.", textEN: "I am comfortable with established customs and methods.", key: "D" },
  { facetId: 10, dich: "SN", textES: "Disfruto ser poco convencional.", textEN: "I enjoy being unconventional.", key: "I" },
  { facetId: 10, dich: "SN", textES: "Prefiero lo probado a lo experimental.", textEN: "I prefer the proven to the experimental.", key: "D" },
  // Facet 11
  { facetId: 11, dich: "TF", textES: "Creo que el análisis lógico es la mejor base para tomar decisiones.", textEN: "I believe logical analysis is the best basis for making decisions.", key: "D" },
  { facetId: 11, dich: "TF", textES: "Al decidir, lo primero que considero es lo que la gente valora y quiere.", textEN: "When deciding, the first thing I consider is what people value and want.", key: "I" },
  { facetId: 11, dich: "TF", textES: "Busco la imparcialidad aunque el resultado incomode a alguien.", textEN: "I aim for impartiality even when the outcome makes someone uncomfortable.", key: "D" },
  { facetId: 11, dich: "TF", textES: "Mis valores personales pesan más que los datos duros.", textEN: "My personal values weigh more than hard data.", key: "I" },
  { facetId: 11, dich: "TF", textES: "Uso datos objetivos para resolver las decisiones difíciles.", textEN: "I use objective data to settle difficult decisions.", key: "D" },
  // Facet 12
  { facetId: 12, dich: "TF", textES: "En la práctica sigo la cadena de causa y efecto hasta la conclusión.", textEN: "In practice I follow the chain of cause and effect to its conclusion.", key: "D" },
  { facetId: 12, dich: "TF", textES: "En la práctica termino ajustando mis decisiones para no lastimar a nadie.", textEN: "In practice I end up adjusting my decisions so nobody gets hurt.", key: "I" },
  { facetId: 12, dich: "TF", textES: "Me acerco a las situaciones como un observador imparcial.", textEN: "I approach situations as an impartial observer.", key: "D" },
  { facetId: 12, dich: "TF", textES: "La lealtad hacia las personas involucradas guía mis decisiones.", textEN: "Loyalty to the people involved guides my decisions.", key: "I" },
  { facetId: 12, dich: "TF", textES: "Ajusto el principio general cuando el caso concreto lo pide por las personas involucradas.", textEN: "I adjust the general principle when the particular case calls for it because of the people involved.", key: "I" },
  // Facet 13
  { facetId: 13, dich: "TF", textES: "Hago muchas preguntas para precisar de qué estamos hablando.", textEN: "I ask a lot of questions to pin down what we are actually talking about.", key: "D" },
  { facetId: 13, dich: "TF", textES: "Prefiero ceder antes que sostener una discusión.", textEN: "I would rather give in than hold an argument.", key: "I" },
  { facetId: 13, dich: "TF", textES: "Señalo las inconsistencias que detecto, aunque incomoden.", textEN: "I point out inconsistencies I notice, even when it is awkward.", key: "D" },
  { facetId: 13, dich: "TF", textES: "Busco que todos queden conformes, aunque el punto quede sin aclarar.", textEN: "I look for everyone to be satisfied, even if the point stays unresolved.", key: "I" },
  { facetId: 13, dich: "TF", textES: "Insisto hasta obtener las respuestas que necesito.", textEN: "I keep pressing until I get the answers I need.", key: "D" },
  // Facet 14
  { facetId: 14, dich: "TF", textES: "Detecto rápido las fallas de un argumento y las digo.", textEN: "I spot the flaws in an argument quickly and say so.", key: "D" },
  { facetId: 14, dich: "TF", textES: "Tiendo a dar el beneficio de la duda antes que criticar.", textEN: "I tend to give the benefit of the doubt before criticizing.", key: "I" },
  { facetId: 14, dich: "TF", textES: "Soy escéptico: pido pruebas antes de aceptar algo.", textEN: "I am skeptical: I ask for evidence before accepting something.", key: "D" },
  { facetId: 14, dich: "TF", textES: "Me sale más natural reconocer méritos que señalar errores.", textEN: "Recognizing merit comes more naturally to me than pointing out errors.", key: "I" },
  { facetId: 14, dich: "TF", textES: "Prefiero construir sobre lo que ya funciona antes que desarmar lo que está mal.", textEN: "I would rather build on what already works than take apart what is wrong.", key: "I" },
  // Facet 15
  { facetId: 15, dich: "TF", textES: "Una vez tomada la decisión, empujo para que se cumpla.", textEN: "Once the decision is made, I push to see it through.", key: "D" },
  { facetId: 15, dich: "TF", textES: "Me cuesta sostener una decisión cuando veo que alguien la está sufriendo.", textEN: "I find it hard to hold a decision when I see someone suffering under it.", key: "I" },
  { facetId: 15, dich: "TF", textES: "Me enfoco en el resultado final más que en el proceso.", textEN: "I focus on the final result more than on the process.", key: "D" },
  { facetId: 15, dich: "TF", textES: "Cómo se sienten las personas importa tanto como alcanzar el objetivo.", textEN: "How people feel matters as much as reaching the objective.", key: "I" },
  { facetId: 15, dich: "TF", textES: "Estoy dispuesto a usar presión para lograr el objetivo.", textEN: "I am willing to apply pressure to reach the objective.", key: "D" },
  // Facet 16
  { facetId: 16, dich: "JP", textES: "Trabajo mejor con un orden y una estructura definidos.", textEN: "I work better with a defined order and structure.", key: "D" },
  { facetId: 16, dich: "JP", textES: "Las interrupciones no me molestan; me acomodo sobre la marcha.", textEN: "Interruptions don't bother me; I adjust as I go.", key: "I" },
  { facetId: 16, dich: "JP", textES: "Me disgustan las desviaciones cuando estoy metido en un proyecto.", textEN: "I dislike diversions when I am deep in a project.", key: "D" },
  { facetId: 16, dich: "JP", textES: "Soy relajado con el orden; las cosas ya se acomodarán.", textEN: "I am relaxed about order; things will fall into place.", key: "I" },
  { facetId: 16, dich: "JP", textES: "Sigo una secuencia clara para avanzar.", textEN: "I follow a clear sequence to move forward.", key: "D" },
  // Facet 17
  { facetId: 17, dich: "JP", textES: "Hago planes con anticipación y los dejo cerrados.", textEN: "I plan ahead and settle my plans.", key: "D" },
  { facetId: 17, dich: "JP", textES: "Prefiero decidir sobre la marcha, sobre todo en mi tiempo libre.", textEN: "I prefer to decide as I go, especially in my free time.", key: "I" },
  { facetId: 17, dich: "JP", textES: "Me incomodan los compromisos que me amarran a una fecha.", textEN: "Commitments that tie me to a date make me uneasy.", key: "I" },
  { facetId: 17, dich: "JP", textES: "Me tranquiliza tener el futuro previsto.", textEN: "Having the future mapped out puts me at ease.", key: "D" },
  { facetId: 17, dich: "JP", textES: "Prefiero que las actividades se vayan desdoblando solas.", textEN: "I prefer to let activities unfold on their own.", key: "I" },
  // Facet 18
  { facetId: 18, dich: "JP", textES: "Empiezo las tareas apenas me las asignan.", textEN: "I start tasks as soon as they are assigned to me.", key: "D" },
  { facetId: 18, dich: "JP", textES: "Rindo mejor cuando la fecha límite ya está encima.", textEN: "I perform better when the deadline is already on top of me.", key: "I" },
  { facetId: 18, dich: "JP", textES: "Dejar las cosas para el final me genera estrés.", textEN: "Leaving things until the end stresses me out.", key: "D" },
  { facetId: 18, dich: "JP", textES: "Necesito saber qué tan tarde puedo empezar y aun así cumplir.", textEN: "I need to know how late I can start and still deliver.", key: "I" },
  { facetId: 18, dich: "JP", textES: "Trabajo por rachas intensas más que de forma constante.", textEN: "I work in intense bursts rather than at a steady pace.", key: "I" },
  // Facet 19
  { facetId: 19, dich: "JP", textES: "Las rutinas y los procedimientos me ayudan a rendir.", textEN: "Routines and procedures help me perform.", key: "D" },
  { facetId: 19, dich: "JP", textES: "Las rutinas me estorban para aprovechar lo inesperado.", textEN: "Routines get in the way of taking advantage of the unexpected.", key: "I" },
  { facetId: 19, dich: "JP", textES: "Hago listas y las sigo.", textEN: "I make lists and follow them.", key: "D" },
  { facetId: 19, dich: "JP", textES: "Quiero variedad; repetir el mismo esquema me agota.", textEN: "I want variety; repeating the same pattern wears me out.", key: "I" },
  { facetId: 19, dich: "JP", textES: "Me siento mejor con un horario definido.", textEN: "I feel better with a defined schedule.", key: "D" },
  // Facet 20
  { facetId: 20, dich: "JP", textES: "Ante un proyecto grande, desgloso las subtareas antes de empezar.", textEN: "Faced with a large project, I break out the subtasks before starting.", key: "D" },
  { facetId: 20, dich: "JP", textES: "Me lanzo y la estrategia va apareciendo en el camino.", textEN: "I plunge in and the strategy appears along the way.", key: "I" },
  { facetId: 20, dich: "JP", textES: "Sigo un orden de pasos definido de antemano.", textEN: "I follow a sequence of steps defined in advance.", key: "D" },
  { facetId: 20, dich: "JP", textES: "Confío en que la solución va a emerger, sin importar por dónde empiece.", textEN: "I trust the solution will emerge no matter where I begin.", key: "I" },
  { facetId: 20, dich: "JP", textES: "Anoto y organizo cada paso del trabajo.", textEN: "I write down and organize every stage of the work.", key: "D" },
];

export const FACETS: FacetDef[] = facetTemplates.map((ft) => {
  const items = rawItems
    .filter((ri) => ri.facetId === ft.id)
    .map((ri, idx) => ({
      id: (ft.id - 1) * 5 + idx + 1,
      facetId: ri.facetId,
      dich: ri.dich,
      textES: ri.textES,
      textEN: ri.textEN,
      key: ri.key,
    }));
  return { ...ft, items } as FacetDef;
});

export const ALL_ITEMS: TestItem[] = FACETS.flatMap((f) => f.items);

// =====================================================================
// Decision styles (3×3 crossing of facet 11 and 12)
// =====================================================================
export const DECISION_STYLES: Record<string, DecisionStyle> = {
  LL: { f11: "L", f12: "L", nameES: "Analítico lógico", nameEN: "Hard-headed analytical", descES: "Tomas decisiones basadas en análisis objetivo y principios coherentes. Priorizas la verdad y la eficiencia por encima de las conveniencias sociales.", descEN: "You make decisions based on objective analysis and coherent principles. You prioritize truth and efficiency over social convenience." },
  LM: { f11: "L", f12: "M", nameES: "Lógico pragmático", nameEN: "Pragmatic logical", descES: "Razonas con lógica pero adaptas el método según el contexto. Eres flexible en la forma sin renunciar al rigor del contenido.", descEN: "You reason logically but adapt your method to context. You are flexible in form without giving up content rigor." },
  LR: { f11: "L", f12: "R", nameES: "Lógico adaptativo", nameEN: "Adaptive logical", descES: "Analizas con objetividad pero ajustas las conclusiones para proteger a las personas. Tu lógica sirve al bienestar del grupo.", descEN: "You analyze objectively but adjust conclusions to protect people. Your logic serves group wellbeing." },
  ML: { f11: "M", f12: "L", nameES: "Equilibrado objetivo", nameEN: "Balanced objective", descES: "No tienes una inclinación fuerte hacia ningún polo. En decisiones buscas un punto medio entre datos y personas, sin sesgo sistemático.", descEN: "You do not have a strong inclination toward either pole. In decisions you seek a middle ground between data and people, without systematic bias." },
  MM: { f11: "M", f12: "M", nameES: "Centrado", nameEN: "Centered", descES: "Tu perfil de decisión está en zona media en ambos ejes. Eres adaptable y contexto-dependiente: a veces priorizas la lógica, a veces las personas, y no hay un patrón fijo.", descEN: "Your decision profile is midzone on both axes. You are adaptable and context-dependent: sometimes you prioritize logic, sometimes people, with no fixed pattern." },
  MR: { f11: "M", f12: "R", nameES: "Equilibrado empático", nameEN: "Balanced empathetic", descES: "No te inclinas fuertemente hacia ningún polo, pero en la práctica terminas cuidando a las personas. Tu flexibilidad se orienta al bienestar grupal.", descEN: "You do not lean strongly toward either pole, but in practice you end up caring for people. Your flexibility is oriented toward group wellbeing." },
  RL: { f11: "R", f12: "L", nameES: "Empático racional", nameEN: "Rational empathetic", descES: "Valoras a las personas pero mantienes un marco de principios sólido. Tus decisiones consideran el impacto humano dentro de un sistema coherente.", descEN: "You value people but maintain a solid principles framework. Your decisions consider human impact within a coherent system." },
  RM: { f11: "R", f12: "M", nameES: "Empático pragmático", nameEN: "Pragmatic empathetic", descES: "Pones a las personas en el centro pero adaptas el método según la situación. Eres flexible sin perder de vista lo que la gente necesita.", descEN: "You put people at the center but adapt your method to the situation. You are flexible without losing sight of what people need." },
  RR: { f11: "R", f12: "R", nameES: "Empático relacional", nameEN: "Relational empathetic", descES: "Tus decisiones giran en torno a las personas y sus relaciones. Priorizas la armonía y el cuidado mutuo, aunque el análisis lógico quede en segundo plano.", descEN: "Your decisions revolve around people and their relationships. You prioritize harmony and mutual care, even when logical analysis takes a back seat." },
};

// =====================================================================
// Cognitive function dynamics (16 types)
// =====================================================================
export const FUNCTION_DYNAMICS: Record<string, FunctionSet> = {
  ISTJ: { dominant: "Si", auxiliary: "Te", tertiary: "Fi", inferior: "Ne" },
  ISFJ: { dominant: "Si", auxiliary: "Fe", tertiary: "Ti", inferior: "Ne" },
  INFJ: { dominant: "Ni", auxiliary: "Fe", tertiary: "Ti", inferior: "Se" },
  INTJ: { dominant: "Ni", auxiliary: "Te", tertiary: "Fi", inferior: "Se" },
  ISTP: { dominant: "Ti", auxiliary: "Se", tertiary: "Ni", inferior: "Fe" },
  ISFP: { dominant: "Fi", auxiliary: "Se", tertiary: "Ni", inferior: "Te" },
  INFP: { dominant: "Fi", auxiliary: "Ne", tertiary: "Si", inferior: "Te" },
  INTP: { dominant: "Ti", auxiliary: "Ne", tertiary: "Si", inferior: "Fe" },
  ESTP: { dominant: "Se", auxiliary: "Ti", tertiary: "Fe", inferior: "Ni" },
  ESFP: { dominant: "Se", auxiliary: "Fi", tertiary: "Te", inferior: "Ni" },
  ENFP: { dominant: "Ne", auxiliary: "Fi", tertiary: "Te", inferior: "Si" },
  ENTP: { dominant: "Ne", auxiliary: "Ti", tertiary: "Fe", inferior: "Si" },
  ESTJ: { dominant: "Te", auxiliary: "Si", tertiary: "Ne", inferior: "Fi" },
  ESFJ: { dominant: "Fe", auxiliary: "Si", tertiary: "Ne", inferior: "Ti" },
  ENFJ: { dominant: "Fe", auxiliary: "Ni", tertiary: "Se", inferior: "Ti" },
  ENTJ: { dominant: "Te", auxiliary: "Ni", tertiary: "Se", inferior: "Fi" },
};

export const FUNCTION_NAMES: Record<string, { nameES: string; nameEN: string; descES: string; descEN: string }> = {
  Si: { nameES: "Sensación introvertida", nameEN: "Introverted Sensing", descES: "Percibes y comparas el presente con experiencias pasadas, buscando certeza y detalle.", descEN: "You perceive and compare the present with past experiences, seeking certainty and detail." },
  Se: { nameES: "Sensación extravertida", nameEN: "Extraverted Sensing", descES: "Percibes el mundo externo en tiempo real, buscando acción, estímulos y oport concretas.", descEN: "You perceive the external world in real time, seeking action, stimuli and concrete opportunities." },
  Ni: { nameES: "Intuición introvertida", nameEN: "Introverted Intuition", descES: "Percibes patrones subyacentes y posibilidades futuras de forma abstracta e interna.", descEN: "You perceive underlying patterns and future possibilities in an abstract, internal way." },
  Ne: { nameES: "Intuición extravertida", nameEN: "Extraverted Intuition", descES: "Exploras ideas, conexiones y posibilidades nuevas en el mundo externo.", descEN: "You explore ideas, connections and new possibilities in the external world." },
  Ti: { nameES: "Pensamiento introvertido", nameEN: "Introverted Thinking", descES: "Analizas internamente la coherencia lógica de las ideas, buscando precisión y verdad interna.", descEN: "You internally analyze the logical coherence of ideas, seeking precision and internal truth." },
  Te: { nameES: "Pensamiento extravertido", nameEN: "Extraverted Thinking", descES: "Organizas el mundo externo con lógica, eficiencia y estructura, buscando resultados medibles.", descEN: "You organize the external world with logic, efficiency and structure, seeking measurable results." },
  Fi: { nameES: "Sentimiento introvertido", nameEN: "Introverted Feeling", descES: "Evalúas situaciones desde valores personales profundos, buscando autenticidad y significado.", descEN: "You evaluate situations from deep personal values, seeking authenticity and meaning." },
  Fe: { nameES: "Sentimiento extravertido", nameEN: "Extraverted Feeling", descES: "Mantienes armonía social considerando los valores y sentimientos de los demás.", descEN: "You maintain social harmony by considering the values and feelings of others." },
};

// =====================================================================
// Applied tables
// =====================================================================
export const APPLIED_TABLES: AppliedTableDef[] = [
  {
    key: "communication",
    titleES: "Comunicar",
    titleEN: "Communicating",
    introES: "Estas facetas influyen en cómo te comunicas, conectas y participas en conversaciones.",
    introEN: "These facets influence how you communicate, connect and participate in conversations.",
    facetIds: [1, 2, 3, 4, 5, 11, 13, 14, 15],
  },
  {
    key: "deciding",
    titleES: "Decidir",
    titleEN: "Deciding",
    introES: "Estas facetas describen cómo tomas decisiones y qué consideras prioritario.",
    introEN: "These facets describe how you make decisions and what you prioritize.",
    facetIds: [11, 12, 13, 14, 15],
  },
  {
    key: "change",
    titleES: "Cambio",
    titleEN: "Change",
    introES: "Estas facetas reflejan tu actitud ante la novedad, la flexibilidad y la adaptación.",
    introEN: "These facets reflect your attitude toward novelty, flexibility and adaptation.",
    facetIds: [6, 7, 8, 9, 10, 16, 17, 18, 20],
  },
  {
    key: "conflict",
    titleES: "Conflicto",
    titleEN: "Conflict",
    introES: "Estas facetas muestran cómo manejas desacuerdos y presiones interpersonales.",
    introEN: "These facets show how you handle disagreement and interpersonal pressure.",
    facetIds: [11, 12, 13, 14, 15, 16],
  },
];

// =====================================================================
// Scoring constants
// =====================================================================
export const K_PCI = 1.2;
export const ITEMS_PER_PAGE = 20;
export const TOTAL_ITEMS = 100;
export const TOTAL_FACETS = 20;

// =====================================================================
// Helper: Likert labels
// =====================================================================
export const LIKERT_LABELS_ES = [
  "",
  "Muy en desacuerdo",
  "En desacuerdo",
  "Ni una ni otra",
  "De acuerdo",
  "Muy de acuerdo",
];
export const LIKERT_LABELS_EN = [
  "",
  "Strongly disagree",
  "Disagree",
  "Neither",
  "Agree",
  "Strongly agree",
];

// =====================================================================
// Helper: decision questions
// =====================================================================
export const DECISION_QUESTIONS: { id: string; textES: string; textEN: string; pole: "L" | "R" | "both"; }[] = [
  { id: "dq1", textES: "¿He considerado los datos objetivos disponibles?", textEN: "Have I considered the objective data available?", pole: "L" },
  { id: "dq2", textES: "¿He evaluado el impacto en las personas involucradas?", textEN: "Have I evaluated the impact on the people involved?", pole: "R" },
  { id: "dq3", textES: "¿La decisión es coherente con principios generales?", textEN: "Is the decision consistent with general principles?", pole: "L" },
  { id: "dq4", textES: "¿He consultado a quienes se verán afectados?", textEN: "Have I consulted those who will be affected?", pole: "R" },
  { id: "dq5", textES: "¿He anticipado las consecuencias a largo plazo?", textEN: "Have I anticipated the long-term consequences?", pole: "both" },
];