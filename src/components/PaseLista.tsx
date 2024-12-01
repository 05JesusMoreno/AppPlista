import { IonContent, IonHeader, IonPage } from "@ionic/react";
import { BarcodeScanner } from "@capacitor-community/barcode-scanner";
import React, { useState } from "react";
import ExcelJS from "exceljs"; // Asegúrate de importar ExcelJS
import "./paseLista.css";
import { useHistory } from "react-router";

const PaseLista: React.FC = () => {
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [studentData, setStudentData] = useState<string | React.ReactNode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scannedData, setScannedData] = useState<any[]>([]); // Arreglo para almacenar los datos escaneados
  const history=useHistory();
  
  // Datos de estudiantes
  const estudiantes: Record<string, any> = {
    "22413070090141": "AMADOR BAUTISTA JORGE ALEJANDRO",
    "22413070090209": "AMADOR SAN JUAN IRIS YELEINE",
    "22413070090199": {
      matricula: "22413070090199",
      nombre: "CRUZ BAUTISTA YUSMAR",
      semestre: "5",
      grupo: "I",
      enlace: "http://www.cecyteh.edu.mx/consulta_alumno/index.php?id=ZlE5ckdvRGJZdDhmdi84MEYrOW1Xdz09",
    },
    "22413070090281": {
      matricula: "22413070090281",
      nombre: "CORTEZ DE LA CRUZ JORGE EDUARDO",
      semestre: "5",
      grupo: "I",
      enlace: "http://www.cecyteh.edu.mx/consulta_alumno/index.php?id=TElHaE1NZ1daYnN6OWZQVjFGY2VJZz09",
    },
    // Agrega más estudiantes aquí...
  };

  // Función para iniciar el escaneo
  const startScan = async () => {
    try {
      // Pedir permiso para usar la cámara
      await BarcodeScanner.checkPermission({ force: true });

      // Hacer que la app entre en modo de escaneo
      //await BarcodeScanner.hideBackground(); // Opcional: ocultar la UI trasera

      const result = await BarcodeScanner.startScan(); // Inicia el escaneo

      if (result.hasContent) {
        // Si se escaneó un código, guardar el contenido
        setScannedCode(result.content);
        console.log(scannedCode);
        // Verificar si el código escaneado está en los datos de estudiantes
        const estudiante = estudiantes[result.content];

        // Si el estudiante tiene información
        if (estudiante) {
          if (typeof estudiante === "object" && estudiante.enlace) {
            // Si tiene un enlace, mostrar el nombre y el enlace
            setStudentData(
              <div>
                <p>Matricula: {estudiante.matricula}</p>
                <p>Nombre: {estudiante.nombre}</p>
                <p>Grupo: {estudiante.grupo} </p>
                <p>Semestre: {estudiante.semestre} </p>
                <a href={estudiante.enlace} target="_blank" rel="noopener noreferrer">
                  Ver más detalles
                </a>
              </div>
            );
          } else {
            // Si solo tiene el nombre, mostrar solo el nombre
            setStudentData(<p>{estudiante}</p>);
          }

          // Agregar el estudiante escaneado a los datos de asistencia
          setScannedData((prevData) => [
            ...prevData,
            {
              matricula: estudiante.matricula || estudiante,
              nombreCompleto: estudiante.nombre || estudiante,
              grupo: estudiante.grupo || estudiante,
              semestre: estudiante.semestre || estudiante,
              asistencia: "Presente",
              fecha: new Date().toLocaleDateString(),
            },
          ]);
        } else {
          // Si no se encuentra el estudiante por código, verificar en los enlaces
          const estudiantePorEnlace = Object.values(estudiantes).find(
            (item) => typeof item === "object" && item.enlace === result.content
          );

          if (estudiantePorEnlace) {
            setStudentData(
              <div>
               <p>Matricula: {estudiantePorEnlace.matricula}</p> 
                <p>Nombre: {estudiantePorEnlace.nombre}</p>
                <p>Grupo: {estudiantePorEnlace.grupo} </p>
                <p>Semestre: {estudiantePorEnlace.semestre} </p>
                <a href={estudiantePorEnlace.enlace} target="_blank" rel="noopener noreferrer">
                  Ver más detalles
                </a>
              </div>
            );

            // Agregar el estudiante escaneado a los datos de asistencia
            setScannedData((prevData) => [
              ...prevData,
              {
                matricula: estudiantePorEnlace.matricula,
                nombreCompleto: estudiantePorEnlace.nombre,
                grupo: estudiantePorEnlace.grupo,
                semestre: estudiantePorEnlace.semestre,
                asistencia: "Presente",
                fecha: new Date().toLocaleDateString(),
              },
            ]);
          } else {
            setStudentData(<p>Estudiante no encontrado</p>);
          }
        }
      }
    } catch (err) {
      setError("Error al escanear el código");
    } finally {
      // Detener el escáner después de usarlo
      BarcodeScanner.showBackground();
      BarcodeScanner.stopScan();
    }
  };

  // Función para guardar los datos en Excel en memoria
  const guardarAsistencia = () => {
    if (scannedData.length === 0) {
      setError("No hay datos para guardar.");
      return;
    }

    setError("Datos guardados en memoria con éxito.");
    setScannedCode(null);  // Limpiar el código escaneado
    setStudentData(null);   // Limpiar los datos del estudiante// Limpiar los datos del estudiante
  };

  // Función para descargar el archivo Excel
  const descargarAsistencia = async () => {
    if (scannedData.length === 0) {
      setError("No hay datos para descargar.");
      return;
    }

    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Asistencia");

      worksheet.columns = [
        { header: "Matricula", key: "matricula" },
        { header: "Nombre Completo", key: "nombreCompleto" },
        { header: "Grupo", key: "grupo" },
        { header: "Semestre", key: "semestre" },
        { header: "Asistencia", key: "asistencia" },
        { header: "Fecha", key: "fecha" },
      ];

      scannedData.forEach((item) => {
        worksheet.addRow(item);
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "asistencia.xlsx";
      link.click();
      URL.revokeObjectURL(url);

      setError("Archivo Excel descargado con éxito.");
    } catch (error) {
      setError("Error al guardar el archivo Excel.");
      console.error(error);
    }
  };

  const inicio =()=>{
    history.push('/')
  }

  return (
    <IonPage>
      <IonHeader className="Header">Pase Lista</IonHeader>

      <IonContent>
        <div className="content">
          <p>Escanear código</p>
        </div>
        <div>
          <button onClick={startScan} className="btn">
            Escanear código
          </button>
        </div>
        <div>
          {/* Mostrar los datos del estudiante o el error */}
          {studentData && <div>{studentData}</div>}
          {error && <p className="error">{error}</p>}
        </div>
        <div>
          {/* Botón para guardar los datos en memoria */}
          <button onClick={guardarAsistencia} className="btn">
            Guardar Asistencia
          </button>
        </div>
        <div>
          {/* Botón para descargar el archivo Excel */}
          <button onClick={descargarAsistencia} className="btn">
            Descargar Asistencia
          </button>
        </div>
        <div className="btn" onClick={inicio}>
            Inicio
        </div>
      </IonContent>
    </IonPage>
  );
};

export default PaseLista;
