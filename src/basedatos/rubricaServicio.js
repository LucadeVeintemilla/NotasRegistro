import AsyncStorage from '@react-native-async-storage/async-storage';

const CLAVE_RUBRICA = '@app_notas:rubrica';
const CLAVE_EVALUACIONES = '@app_notas:evaluaciones';

/**
 * Datos de la rúbrica predefinida
 */
const rubricaPredefinida = [
  {
    id: 1,
    criterio: "ACTITUD",
    indicadores: [
      {
        id: 1,
        nombre: "Presentación y postura",
        opciones: [
          { label: "Deficiente", value: 0 },
          { label: "Regular", value: 0.25 },
          { label: "Bueno", value: 0.5 },
          { label: "Muy Bueno", value: 0.75 },
          { label: "Excelente", value: 1 },
        ],
      },
      {
        id: 2,
        nombre: "Tono de voz y lenguaje acorde al tema",
        opciones: [
          { label: "Deficiente", value: 0 },
          { label: "Regular", value: 0.25 },
          { label: "Bueno", value: 0.5 },
          { label: "Muy Bueno", value: 0.75 },
          { label: "Excelente", value: 1 },
        ],
      },
    ],
  },
  {
    id: 2,
    criterio: "DEL CONTENIDO DE LA PRESENTACIÓN",
    indicadores: [
      {
        id: 3,
        nombre: "Orden y secuencia de la presentación",
        opciones: [
          { label: "Deficiente", value: 0 },
          { label: "Regular", value: 0.25 },
          { label: "Bueno", value: 0.5 },
          { label: "Muy Bueno", value: 0.75 },
          { label: "Excelente", value: 1 },
        ],
      },
      {
        id: 4,
        nombre: "Es llamativo, prioriza gráficos antes que texto",
        opciones: [
          { label: "Deficiente", value: 0 },
          { label: "Regular", value: 0.25 },
          { label: "Bueno", value: 0.5 },
          { label: "Muy Bueno", value: 0.75 },
          { label: "Excelente", value: 1 },
        ],
      },
      {
        id: 5,
        nombre: "Presenta los objetivos y resultados con claridad",
        opciones: [
          { label: "Deficiente", value: 0 },
          { label: "Regular", value: 0.25 },
          { label: "Bueno", value: 0.5 },
          { label: "Muy Bueno", value: 0.75 },
          { label: "Excelente", value: 1 },
        ],
      },
      {
        id: 6,
        nombre: "Coherencia con el trabajo escrito",
        opciones: [
          { label: "Deficiente", value: 0 },
          { label: "Regular", value: 0.5 },
          { label: "Bueno", value: 1 },
          { label: "Muy Bueno", value: 1.5 },
          { label: "Excelente", value: 2 },
        ],
      },
    ],
  },
  {
    id: 3,
    criterio: "EXPOSICIÓN",
    indicadores: [
      {
        id: 7,
        nombre: "Demuestra dominio del tema durante la defensa",
        opciones: [
          { label: "Deficiente", value: 0 },
          { label: "Regular", value: 1 },
          { label: "Bueno", value: 2 },
          { label: "Muy Bueno", value: 3 },
          { label: "Excelente", value: 4 },
        ],
      },
      {
        id: 8,
        nombre: "Presenta con precisión los resultados de la investigación",
        opciones: [
          { label: "Deficiente", value: 0 },
          { label: "Regular", value: 1 },
          { label: "Bueno", value: 2 },
          { label: "Muy Bueno", value: 3 },
          { label: "Excelente", value: 4 },
        ],
      },
      {
        id: 9,
        nombre: "Responde correctamente y con seguridad las preguntas del tribunal",
        opciones: [
          { label: "Deficiente", value: 0 },
          { label: "Regular", value: 1 },
          { label: "Bueno", value: 2 },
          { label: "Muy Bueno", value: 3 },
          { label: "Excelente", value: 4 },
        ],
      },
      {
        id: 10,
        nombre: "Respeta el tiempo establecido de la exposición",
        opciones: [
          { label: "Deficiente", value: 0 },
          { label: "Regular", value: 0.25 },
          { label: "Bueno", value: 0.5 },
          { label: "Muy Bueno", value: 0.75 },
          { label: "Excelente", value: 1 },
        ],
      },
    ],
  },
];

/**
 * Inicializa la rúbrica en AsyncStorage
 * @returns {Promise<void>}
 */
export const inicializarRubrica = async () => {
  try {
    const rubricaExistente = await AsyncStorage.getItem(CLAVE_RUBRICA);
    if (!rubricaExistente) {
      await AsyncStorage.setItem(CLAVE_RUBRICA, JSON.stringify(rubricaPredefinida));
    }
  } catch (error) {
    console.error('Error al inicializar rúbrica:', error);
  }
};

/**
 * Obtiene la rúbrica completa
 * @returns {Promise<Array>} La rúbrica con todos sus criterios e indicadores
 */
export const obtenerRubricaCompleta = async () => {
  try {
    await inicializarRubrica();
    const rubricaJSON = await AsyncStorage.getItem(CLAVE_RUBRICA);
    return JSON.parse(rubricaJSON || '[]');
  } catch (error) {
    console.error('Error al obtener rúbrica:', error);
    return [];
  }
};

/**
 * Guarda una nueva evaluación
 * @param {Object} evaluacion Objeto con los datos de la evaluación
 * @returns {Promise<string>} ID de la evaluación guardada
 */
export const guardarEvaluacion = async (evaluacion) => {
  try {
    const evaluacionesJSON = await AsyncStorage.getItem(CLAVE_EVALUACIONES);
    const evaluaciones = JSON.parse(evaluacionesJSON || '[]');
    
    // Generar un ID único para la evaluación
    const evaluacionId = Date.now().toString();
    const nuevaEvaluacion = {
      id: evaluacionId,
      ...evaluacion,
    };
    
    evaluaciones.push(nuevaEvaluacion);
    await AsyncStorage.setItem(CLAVE_EVALUACIONES, JSON.stringify(evaluaciones));
    
    return evaluacionId;
  } catch (error) {
    console.error('Error al guardar evaluación:', error);
    throw error;
  }
};

/**
 * Obtiene todas las evaluaciones guardadas
 * @returns {Promise<Array>} Lista de evaluaciones
 */
export const obtenerEvaluaciones = async () => {
  try {
    const evaluacionesJSON = await AsyncStorage.getItem(CLAVE_EVALUACIONES);
    return JSON.parse(evaluacionesJSON || '[]');
  } catch (error) {
    console.error('Error al obtener evaluaciones:', error);
    return [];
  }
};

/**
 * Obtiene una evaluación por su ID
 * @param {string} evaluacionId ID de la evaluación a obtener
 * @returns {Promise<Object|null>} Evaluación encontrada o null si no existe
 */
export const obtenerEvaluacionPorId = async (evaluacionId) => {
  try {
    const evaluaciones = await obtenerEvaluaciones();
    return evaluaciones.find(e => e.id === evaluacionId) || null;
  } catch (error) {
    console.error('Error al obtener evaluación por ID:', error);
    return null;
  }
};

/**
 * Elimina una evaluación por su ID
 * @param {string} evaluacionId ID de la evaluación a eliminar
 * @returns {Promise<boolean>} true si se eliminó correctamente, false en caso contrario
 */
export const eliminarEvaluacion = async (evaluacionId) => {
  try {
    const evaluaciones = await obtenerEvaluaciones();
    const nuevasEvaluaciones = evaluaciones.filter(e => e.id !== evaluacionId);
    await AsyncStorage.setItem(CLAVE_EVALUACIONES, JSON.stringify(nuevasEvaluaciones));
    return true;
  } catch (error) {
    console.error('Error al eliminar evaluación:', error);
    return false;
  }
};
