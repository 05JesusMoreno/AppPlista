import { useHistory } from 'react-router';
import './ExploreContainer.css';

interface ContainerProps { }


const ExploreContainer: React.FC<ContainerProps> = () => {
  const history=useHistory();
  
  const PaseL =()=>{
    history.push('/PaseLista');
  }

  return (
    <div id="container">
      <strong>Bienvenido a la aplicacion de pases de lista de Alumnos Cecyteh Atlapexco</strong>
      <div>
        <button onClick={PaseL} className='btn' type='submit'> Pasar lista </button>
      </div>
    </div>
    
  );
};

export default ExploreContainer;
