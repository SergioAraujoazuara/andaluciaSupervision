import React, { useEffect, useState } from 'react';
import { Chart } from 'react-google-charts';

const GraficaLotesPorSector = ({ filteredLotes }) => {
  const [datosLotesPorSector, setDatosLotesPorSector] = useState([]);
  const [sectorSeleccionado, setSectorSeleccionado] = useState('Todos'); // Estado para el filtro de sector

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
    const data = [['Sector', 'Número de Lotes']];
    Object.entries(lotesPorSector).forEach(([sector, count]) => {
      data.push([sector, count]);
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
    <div className='bg-gray-200 p-4 rounded-lg shadow-lg'>
      
      
      {/* Filtro de sector */}
      <div className='mb-4'>
        
        <select id='sector-select' className='rounded-lg p-1 bg-gray-100' value={sectorSeleccionado} onChange={handleSectorChange}>
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
          title: 'Número de Lotes por Sector',
          hAxis: { title: 'Sector' },
          vAxis: { title: 'Número de Lotes', minValue: 0, maxValue: maxValue, format: '0' }, // Configurar maxValue dinámicamente
          legend: { position: 'none' },
          colors: ['#14b8a6'],
        }}
      />
    </div>
  );
};

export default GraficaLotesPorSector;
