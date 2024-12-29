// pages/index.js
import Link from 'next/link';
import styles from '../styles/Home.module.scss';

export default function Home() {
  return (
    <div className={styles.container}>
      {/* Logo FIFA */}
      <img src="/fifa-logo.png" alt="FIFA Logo" className={styles.logo} />

      <h1 className={styles.title}>Campeonato de FIFA 25</h1>

      <p className={styles.subtitle}>
        Bienvenido a la mejor experiencia de fútbol virtual.
      </p>

      <ul className={styles.navList}>
        <li>
          <Link href="/admin" className="btn primary">
            Administrar Jugadores
          </Link>
        </li>
        <li>
          <Link href="/matches" className="btn primary">
            Ingresar Resultados
          </Link>
        </li>
        <li>
          <Link href="/standings" className="btn secondary">
            Ver Tabla de Posiciones
          </Link>
        </li>
      </ul>
    </div>
  );
}
