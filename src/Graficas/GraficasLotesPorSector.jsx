import React, { useEffect, useState } from 'react';
import { Chart } from 'react-google-charts';

const GraficaLotesPorSector = ({ filteredLotes }) => {
  const [datosLotesPorSector, setDatosLotesPorSector] = useState([]);
  const [sectorSeleccionado, setSectorSeleccionado] = useState('Todos'); // Estado para el filtro de sector

  // Lista de colores para las barras
  const colors = ['#fcd34d', '#7dd3fc', '#a5b4fc', '#f9a8d4', '#5eead4', '#bef264', '#fca5a5', '#fdba74'];

  // Función para calcular el número de lotes por sector
  const calcularLotesPorSector = () => {
    const lotesPorSector = {};
    
    // Filtrar los lotes según el sector seleccionado
    const lotesFiltrados = sectorSeleccionado === 'Todos' ? filteredLotes : filteredLotes.filter(lote => lote.sectorNombre === sectorSeleccionado);

    lotesFiltrados.forEach(lote => {
      const sector = lote.sectorNombre || 'Sin sector';
      if (!lotesPorSector[sector]) {
        lotesPorSector[sector] = 0;
      }
      lotesPorSector[sector] += 1;
    });

    // Formatear datos para Google Charts
    const data = [['Sector', 'Número de Lotes', { role: 'style' }]];  // Añadir la columna para estilos de color
    Object.entries(lotesPorSector).forEach(([sector, count], index) => {
      data.push([sector, count, `color: ${colors[index % colors.length]}`]);  // Asignar color de forma cíclica
    });

    return data;
  };

  useEffect(() => {
    if (filteredLotes.length > 0) {
      const data = calcularLotesPorSector();
      setDatosLotesPorSector(data);
    }
  }, [filteredLotes, sectorSeleccionado]); // Dependencia del filtro de sector

  // Calcular el valor máximo para el eje Y con un margen adicional
  const calcularMaxValue = (data) => {
    const maxValue = Math.max(...data.slice(1).map(row => row[1])); // Obtener el valor máximo de los lotes
    return maxValue + 2; // Agregar un margen de 2
  };

  const maxValue = datosLotesPorSector.length > 1 ? calcularMaxValue(datosLotesPorSector) : 10; // Establecer un valor predeterminado si no hay datos

  // Manejar cambios en el filtro de sector
  const handleSectorChange = (e) => {
    setSectorSeleccionado(e.target.value);
  };

  // Obtener los sectores únicos para el filtro
  const obtenerSectoresUnicos = () => {
    const sectores = [...new Set(filteredLotes.map(lote => lote.sectorNombre || 'Sin sector'))];
    return ['Todos', ...sectores]; // Agregar 'Todos' como opción predeterminada
  };

  return (
    <div className='bg-gray-100 p-4 rounded-lg shadow-lg'>
      {/* Filtro de sector */}
      <div className='flex justify-between items-center w-full mb-1'>
        <p className='font-medium'>Lotes por sector</p>
        <select id='sector-select' className='rounded-lg p-1 bg-gray-200' value={sectorSeleccionado} onChange={handleSectorChange}>
          {obtenerSectoresUnicos().map(sector => (
            <option key={sector} value={sector}>{sector}</option>
          ))}
        </select>
      </div>

      {/* Gráfico de columnas para el número de lotes por sector */}
      <Chart
        chartType="ColumnChart"
        width="100%"
        height="250px"
        data={datosLotesPorSector}
        options={{
          hAxis: { title: 'Sector' },
          vAxis: { title: 'Número de Lotes', minValue: 0, maxValue: maxValue, format: '0' }, // Configurar maxValue dinámicamente
          legend: { position: 'none' },
          backgroundColor: '#f3f4f6', // Fondo del gráfico completo
        }}
      />
    </div>
  );
};

export default GraficaLotesPorSector;
