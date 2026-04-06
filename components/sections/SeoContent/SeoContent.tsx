import styles from './SeoContent.module.css';

export default function SeoContent() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <h2 className={styles.heading}>Autos Usados en Mar del Plata — Boston Automotores</h2>
        <div className={styles.content}>
          <p className={styles.text}>
            Boston Automotores es una concesionaria ubicada en el corazón de Mar del Plata, 
            con más de 20 años de experiencia en la comercialización de vehículos usados de 
            primera calidad. Ubicados en Av. Colón 4469, nos hemos consolidado como una de las 
            opciones más confiables para quienes buscan un auto usado en la zona costera.
          </p>
          <p className={styles.text}>
            Ofrecemos una amplia variedad de autos usados, todos rigurosamente inspeccionados 
            para garantizar su calidad y seguridad. Además, contamos con opciones de financiación 
            flexibles adaptadas a las necesidades de cada cliente, y todos nuestros vehículos 
            incluyen garantía mecánica para mayor tranquilidad.
          </p>
          <p className={styles.text}>
            Nuestro compromiso es brindar una experiencia de compra transparente y sin 
            complicaciones. Ya sea que buscas tu primer auto, un vehículo familiar o una 
            pickup para trabajo, en Boston Automotores encontrarás asesoramiento personalizado 
            y las mejores opciones del mercado en autos usados en Mar del Plata.
          </p>
        </div>
      </div>
    </section>
  );
}