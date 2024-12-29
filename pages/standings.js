// pages/standings.js
import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '../styles/Standing.module.scss';

// Firestore
import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function StandingsPage() {
  const [players, setPlayers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [standings, setStandings] = useState([]);

  const playersColRef = collection(db, 'players');
  const matchesColRef = collection(db, 'matches');

  // Cargar data al montar
  useEffect(() => {
    const loadData = async () => {
      try {
        // Jugadores
        const snapPlayers = await getDocs(playersColRef);
        const playersData = snapPlayers.docs.map((d) => ({ id: d.id, ...d.data() }));

        // Partidos
        const snapMatches = await getDocs(matchesColRef);
        const matchesData = snapMatches.docs.map((d) => ({ id: d.id, ...d.data() }));

        setPlayers(playersData);
        setMatches(matchesData);

        // Calcular standings
        const newTable = calculateStandings(playersData, matchesData);
        setStandings(newTable);
      } catch (err) {
        console.error('Error al cargar data:', err);
      }
    };
    loadData().catch(console.error);
  }, []);

  // Recalcular cada vez que cambie players o matches
  useEffect(() => {
    if (players.length > 0 && matches.length > 0) {
      setStandings(calculateStandings(players, matches));
    }
  }, [players, matches]);

  const calculateStandings = (playersArr, matchesArr) => {
    const tableMap = {};
    // Inicializar cada jugador
    playersArr.forEach((p) => {
      tableMap[p.name] = {
        name: p.name,
        imageUrl: p.imageUrl,
        points: 0,
        gf: 0,
        ga: 0,
        dg: 0,
      };
    });

    // Recorrer partidos
    matchesArr.forEach((m) => {
      if (m.homeScore === null || m.awayScore === null) return;

      // Sumar goles
      tableMap[m.homePlayer.name].gf += m.homeScore;
      tableMap[m.homePlayer.name].ga += m.awayScore;
      tableMap[m.awayPlayer.name].gf += m.awayScore;
      tableMap[m.awayPlayer.name].ga += m.homeScore;

      // Actualizar DG
      tableMap[m.homePlayer.name].dg =
        tableMap[m.homePlayer.name].gf - tableMap[m.homePlayer.name].ga;
      tableMap[m.awayPlayer.name].dg =
        tableMap[m.awayPlayer.name].gf - tableMap[m.awayPlayer.name].ga;

      // Calcular Puntos
      if (m.homeScore > m.awayScore) {
        tableMap[m.homePlayer.name].points += 3;
      } else if (m.awayScore > m.homeScore) {
        tableMap[m.awayPlayer.name].points += 3;
      } else {
        // Empate
        tableMap[m.homePlayer.name].points += 1;
        tableMap[m.awayPlayer.name].points += 1;
      }
    });

    // Convertir en array y ordenar
    return Object.values(tableMap).sort((a, b) => {
      if (b.points === a.points) {
        return b.dg - a.dg;
      }
      return b.points - a.points;
    });
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Tabla de Posiciones (con Firebase)</h1>
      {standings.length === 0 ? (
        <p>No hay datos suficientes o no se han ingresado resultados.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Pos</th>
              <th>Jugador</th>
              <th>Pts</th>
              <th>GF</th>
              <th>GC</th>
              <th>DG</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((player, index) => (
              <tr key={player.name}>
                <td>{index + 1}</td>
                <td className={styles.playerCell}>
                  <img
                    src={player.imageUrl}
                    alt={player.name}
                    className={styles.playerImg}
                  />
                  {player.name}
                </td>
                <td>{player.points}</td>
                <td>{player.gf}</td>
                <td>{player.ga}</td>
                <td>{player.dg}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <nav style={{ marginTop: '2rem' }}>
        <Link href="/" className="btn primary">
          Volver al inicio
        </Link>
      </nav>
    </div>
  );
}
