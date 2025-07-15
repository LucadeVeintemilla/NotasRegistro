/*
  Define las dos rúbricas (nueva y antigua) y exporta una función para obtener la
  correcta según el tipo de disertación del estudiante.
*/

// Rúbrica para evaluaciones NUEVAS (actual)
export const rubricaNueva = [
  {
    id: 1,
    criterio: 'ACTITUD',
    indicadores: [
      {
        id: 1,
        nombre: 'Presentación y postura',
        opciones: [
          { label: 'Deficiente', value: 0 },
          { label: 'Regular', value: 0.25 },
          { label: 'Bueno', value: 0.5 },
          { label: 'Muy Bueno', value: 0.75 },
          { label: 'Excelente', value: 1 },
        ],
      },
      {
        id: 2,
        nombre: 'Tono de voz y lenguaje acorde al tema',
        opciones: [
          { label: 'Deficiente', value: 0 },
          { label: 'Regular', value: 0.25 },
          { label: 'Bueno', value: 0.5 },
          { label: 'Muy Bueno', value: 0.75 },
          { label: 'Excelente', value: 1 },
        ],
      },
    ],
  },
  {
    id: 2,
    criterio: 'DEL CONTENIDO DE LA PRESENTACIÓN',
    indicadores: [
      {
        id: 3,
        nombre: 'Orden y secuencia de la presentación',
        opciones: [
          { label: 'Deficiente', value: 0 },
          { label: 'Regular', value: 0.25 },
          { label: 'Bueno', value: 0.5 },
          { label: 'Muy Bueno', value: 0.75 },
          { label: 'Excelente', value: 1 },
        ],
      },
      {
        id: 4,
        nombre: 'Es llamativo, prioriza gráficos antes que texto',
        opciones: [
          { label: 'Deficiente', value: 0 },
          { label: 'Regular', value: 0.25 },
          { label: 'Bueno', value: 0.5 },
          { label: 'Muy Bueno', value: 0.75 },
          { label: 'Excelente', value: 1 },
        ],
      },
      {
        id: 5,
        nombre: 'Presenta los objetivos y resultados con claridad',
        opciones: [
          { label: 'Deficiente', value: 0 },
          { label: 'Regular', value: 0.25 },
          { label: 'Bueno', value: 0.5 },
          { label: 'Muy Bueno', value: 0.75 },
          { label: 'Excelente', value: 1 },
        ],
      },
      {
        id: 6,
        nombre: 'Coherencia con el trabajo escrito',
        opciones: [
          { label: 'Deficiente', value: 0 },
          { label: 'Regular', value: 0.5 },
          { label: 'Bueno', value: 1 },
          { label: 'Muy Bueno', value: 1.5 },
          { label: 'Excelente', value: 2 },
        ],
      },
    ],
  },
  {
    id: 3,
    criterio: 'EXPOSICIÓN',
    indicadores: [
      {
        id: 7,
        nombre: 'Demuestra dominio del tema durante la defensa',
        opciones: [
          { label: 'Deficiente', value: 0 },
          { label: 'Regular', value: 1 },
          { label: 'Bueno', value: 2 },
          { label: 'Muy Bueno', value: 3 },
          { label: 'Excelente', value: 4 },
        ],
      },
      {
        id: 8,
        nombre: 'Presenta con precisión los resultados de la investigación',
        opciones: [
          { label: 'Deficiente', value: 0 },
          { label: 'Regular', value: 1 },
          { label: 'Bueno', value: 2 },
          { label: 'Muy Bueno', value: 3 },
          { label: 'Excelente', value: 4 },
        ],
      },
      {
        id: 9,
        nombre: 'Responde correctamente y con seguridad las preguntas del tribunal',
        opciones: [
          { label: 'Deficiente', value: 0 },
          { label: 'Regular', value: 1 },
          { label: 'Bueno', value: 2 },
          { label: 'Muy Bueno', value: 3 },
          { label: 'Excelente', value: 4 },
        ],
      },
      {
        id: 10,
        nombre: 'Respeta el tiempo establecido de la exposición',
        opciones: [
          { label: 'Deficiente', value: 0 },
          { label: 'Regular', value: 0.25 },
          { label: 'Bueno', value: 0.5 },
          { label: 'Muy Bueno', value: 0.75 },
          { label: 'Excelente', value: 1 },
        ],
      },
    ],
  },
];

// Rúbrica para evaluaciones ANTIGUAS
export const rubricaAntigua = [
  {
    id: 1,
    criterio: 'ACTITUD',
    indicadores: [
      {
        id: 1,
        nombre: 'Presentación y postura',
        opciones: [
          { label: 'Deficiente', value: 0 },
          { label: 'Bueno', value: 0.25 },
          { label: 'Muy Bueno', value: 0.5 },
        ],
      },
      {
        id: 2,
        nombre: 'Tono de voz y lenguaje acorde al tema',
        opciones: [
          { label: 'Deficiente', value: 0 },
          { label: 'Bueno', value: 0.25 },
          { label: 'Muy Bueno', value: 0.5 },
        ],
      },
    ],
  },
  {
    id: 2,
    criterio: 'DEL CONTENIDO DE LA PRESENTACIÓN',
    indicadores: [
      {
        id: 3,
        nombre: 'Orden y secuencia de la presentación',
        opciones: [
          { label: 'Deficiente', value: 0 },
          { label: 'Bueno', value: 0.25 },
          { label: 'Muy Bueno', value: 0.5 },
        ],
      },
      {
        id: 4,
        nombre: 'Es llamativo, prioriza gráficos antes que texto',
        opciones: [
          { label: 'Deficiente', value: 0 },
          { label: 'Bueno', value: 0.25 },
          { label: 'Muy Bueno', value: 0.5 },
        ],
      },
      {
        id: 5,
        nombre: 'Presenta los objetivos y resultados con claridad',
        opciones: [
          { label: 'Deficiente', value: 0 },
          { label: 'Bueno', value: 0.25 },
          { label: 'Muy Bueno', value: 0.5 },
        ],
      },
      {
        id: 6,
        nombre: 'Coherencia con el trabajo escrito',
        opciones: [
          { label: 'Deficiente', value: 0 },
          { label: 'Bueno', value: 0.5 },
          { label: 'Muy Bueno', value: 1 },
        ],
      },
    ],
  },
  {
    id: 3,
    criterio: 'EXPOSICIÓN',
    indicadores: [
      {
        id: 7,
        nombre: 'Demuestra dominio del tema durante la defensa',
        opciones: [
          { label: 'Deficiente', value: 0 },
          { label: 'Bueno', value: 1 },
          { label: 'Muy Bueno', value: 2 },
        ],
      },
      {
        id: 8,
        nombre: 'Presenta con precisión los resultados de la investigación',
        opciones: [
          { label: 'Deficiente', value: 0 },
          { label: 'Bueno', value: 1 },
          { label: 'Muy Bueno', value: 2 },
        ],
      },
      {
        id: 9,
        nombre: 'Responde correctamente y con seguridad las preguntas del tribunal',
        opciones: [
          { label: 'Deficiente', value: 0 },
          { label: 'Bueno', value: 1 },
          { label: 'Muy Bueno', value: 2 },
        ],
      },
      {
        id: 10,
        nombre: 'Respeta el tiempo establecido de la exposición',
        opciones: [
          { label: 'Deficiente', value: 0 },
          { label: 'Bueno', value: 0.25 },
          { label: 'Muy Bueno', value: 0.5 },
        ],
      },
    ],
  },
];

export const obtenerRubricaPorTipo = (tipo = 'actual') => {
  if (tipo === 'antigua') return rubricaAntigua;
  return rubricaNueva;
};
