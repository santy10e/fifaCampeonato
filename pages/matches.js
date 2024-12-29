// pages/matches.js
import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '../styles/Matches.module.scss';

// Firestore
import { db } from '../lib/firebase';
import {
  collection,
  getDocs,
  updateDoc,
  doc
} from 'firebase/firestore';

export default function MatchesPage() {
  const [matches, setMatches] = useState([]);
  const matchesColRef = collection(db, 'matches');

  // Cargar partidos al montar
  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      const snapshot = await getDocs(matchesColRef);
      const data = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setMatches(data);
    } catch (err) {
      console.error('Error al cargar partidos:', err);
    }
  };

  // Manejar cambio de marcador
  const handleScoreChange = async (matchId, homeScore, awayScore) => {
    try {
      // Actualizar en Firestore
      const matchRef = doc(db, 'matches', matchId);
      await updateDoc(matchRef, {
        homeScore: homeScore !== '' ? parseInt(homeScore, 10) : null,
        awayScore: awayScore !== '' ? parseInt(awayScore, 10) : null,
      });
      // Recargar la lista de partidos
      await loadMatches();
    } catch (err) {
      console.error('Error al actualizar marcador:', err);
    }
  };

  if (matches.length === 0) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Partidos</h1>
        <p>No hay partidos generados. Por favor, ve a Administración y genera el fixture.</p>
        <nav>
          <Link href="/" className="btn secondary">
            Volver al inicio
          </Link>
        </nav>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Ingresar Resultados</h1>

      <div className={styles.matchGrid}>
        {matches.map((match) => {
          let matchLabel = 'Partido Único';
          if (match.mode === 'ida') matchLabel = 'Ida';
          if (match.mode === 'vuelta') matchLabel = 'Vuelta';

          return (
            <div key={match.id} className={styles.card}>
              <div className={styles.playersRow}>
                {/* Jugador Local */}
                <div className={styles.playerInfo}>
                  <img
                    src={match.homePlayer?.imageUrl}
                    alt={match.homePlayer?.name}
                    className={styles.playerImg}
                  />
                  <p>{match.homePlayer?.name}</p>
                </div>

                {/* Marcadores */}
                <div className={styles.scoreSection}>
                  <input
                    type="number"
                    className={styles.scoreInput}
                    value={match.homeScore ?? ''}
                    onChange={(e) =>
                      handleScoreChange(
                        match.id,
                        e.target.value,
                        match.awayScore ?? ''
                      )
                    }
                  />
                  <span className={styles.vsText}>vs</span>
                  <input
                    type="number"
                    className={styles.scoreInput}
                    value={match.awayScore ?? ''}
                    onChange={(e) =>
                      handleScoreChange(
                        match.id,
                        match.homeScore ?? '',
                        e.target.value
                      )
                    }
                  />
                </div>

                {/* Jugador Visitante */}
                <div className={styles.playerInfo}>
                  <img
                    src={match.awayPlayer?.imageUrl}
                    alt={match.awayPlayer?.name}
                    className={styles.playerImg}
                  />
                  <p>{match.awayPlayer?.name}</p>
                </div>
              </div>

              <p className={styles.matchType}>{matchLabel}</p>
            </div>
          );
        })}
      </div>

      <nav style={{ marginTop: '2rem' }}>
        <Link href="/" className="btn secondary">
          Volver al inicio
        </Link>
      </nav>
    </div>
  );
}
