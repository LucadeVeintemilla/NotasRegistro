import { StyleSheet } from 'react-native';

const colores = {
  primario: '#3f51b5',
  secundario: '#f50057',
  fondo: '#f5f5f5',
  texto: '#333333',
  textoClaro: '#ffffff',
  borde: '#dddddd',
  exito: '#4caf50',
  error: '#f44336',
  advertencia: '#ff9800',
  info: '#2196f3',
  
  deficiente: '#f44336',
  regular: '#ff9800',
  bueno: '#cddc39',
  muyBueno: '#4caf50',
  excelente: '#2196f3',
};

const estilosGlobales = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: colores.fondo,
  },
  contenedorCentrado: {
    flex: 1,
    backgroundColor: colores.fondo,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  tarjeta: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colores.texto,
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colores.texto,
    marginVertical: 12,
  },
  textoRegular: {
    fontSize: 16,
    color: colores.texto,
    marginVertical: 4,
  },
  textoSecundario: {
    fontSize: 14,
    color: '#757575',
    marginVertical: 4,
  },
  boton: {
    backgroundColor: colores.primario,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 4,
    elevation: 2,
  },
  textoBoton: {
    color: colores.textoClaro,
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
  separador: {
    height: 1,
    backgroundColor: colores.borde,
    marginVertical: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: 4,
    padding: 12,
    marginVertical: 8,
    backgroundColor: '#ffffff',
    fontSize: 16,
  },
  error: {
    color: colores.error,
    fontSize: 14,
    marginTop: 4,
  },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  columna: {
    flex: 1,
  },
  indicadorItem: {
    borderBottomWidth: 1,
    borderBottomColor: colores.borde,
    paddingVertical: 12,
  },
  criterioTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colores.primario,
    marginTop: 24,
    marginBottom: 8,
    backgroundColor: '#e8eaf6',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  opcionesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  opcionItem: {
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: 4,
    padding: 8,
    marginVertical: 4,
    width: '19%',
    alignItems: 'center',
  },
  opcionItemSeleccionado: {
    borderColor: colores.primario,
    backgroundColor: 'rgba(63, 81, 181, 0.1)',
  },
  opcionTexto: {
    fontSize: 12,
    textAlign: 'center',
  },
  opcionValor: {
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
  },
  puntajeTotal: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'right',
    color: colores.primario,
    marginVertical: 16,
  },
});

export { colores, estilosGlobales };
