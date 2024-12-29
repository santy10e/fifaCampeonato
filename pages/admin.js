// pages/admin.js
import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '../styles/Admin.module.scss';

// Importar Firestore
import { db } from '../services/firebase';
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc
} from 'firebase/firestore';

export default function AdminPage() {
  const [playerName, setPlayerName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState(null); // Base64 del archivo subido
  const [players, setPlayers] = useState([]);
  const [champMode, setChampMode] = useState('single'); // 'single' o 'double'

  // Referencias de colecciones Firestore
  const playersColRef = collection(db, 'players');
  const matchesColRef = collection(db, 'matches');

  // Al montar, cargamos los jugadores desde Firestore
  useEffect(() => {
    const fetchPlayers = async () => {
      const snapshot = await getDocs(playersColRef);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setPlayers(data);
    };
    fetchPlayers().catch(console.error);
  }, []);

  // Manejar subida de archivo y convertirlo a Base64
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      alert('Formato de imagen no soportado. Usa JPG o PNG.');
      e.target.value = null;
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImageFile(reader.result); // Base64
    };
    reader.readAsDataURL(file);
  };

  // Agregar jugador en Firestore
  const handleAddPlayer = async (e) => {
    e.preventDefault();
    if (!playerName.trim()) return;

    let finalImage = '/fifa-logo.png';
    if (imageFile) {
      finalImage = imageFile;
    } else if (imageUrl.trim()) {
      finalImage = imageUrl.trim();
    }

    const newPlayer = {
      name: playerName.trim(),
      imageUrl: finalImage
    };

    try {
      await addDoc(playersColRef, newPlayer);
      alert('Jugador agregado a Firebase');

      // Reset form
      setPlayerName('');
      setImageUrl('');
      setImageFile(null);
      e.target.reset();

      // Recargar lista de jugadores
      const snapshot = await getDocs(playersColRef);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setPlayers(data);
    } catch (err) {
      console.error('Error al agregar jugador:', err);
    }
  };

  // Eliminar jugador de Firestore
  const handleRemovePlayer = async (playerIndex) => {
    // Obtenemos el ID del player en el array local
    const playerId = players[playerIndex].id;
    try {
      await deleteDoc(doc(db, 'players', playerId));
      alert('Jugador eliminado');

      // Recargar
      const snapshot = await getDocs(playersColRef);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setPlayers(data);
    } catch (err) {
      console.error('Error al eliminar jugador:', err);
    }
  };

  // Generar Round-Robin simple
  const generateSingleRoundRobin = (playersArr) => {
    const matches = [];
    for (let i = 0; i < playersArr.length; i++) {
      for (let j = i + 1; j < playersArr.length; j++) {
        matches.push({
          homePlayer: playersArr[i],
          awayPlayer: playersArr[j],
          homeScore: null,
          awayScore: null,
          mode: 'single'
        });
      }
    }
    return matches;
  };

  // Generar Round-Robin ida y vuelta
  const generateDoubleRoundRobin = (playersArr) => {
    const matches = [];
    for (let i = 0; i < playersArr.length; i++) {
      for (let j = i + 1; j < playersArr.length; j++) {
        // Ida
        matches.push({
          homePlayer: playersArr[i],
          awayPlayer: playersArr[j],
          homeScore: null,
          awayScore: null,
          mode: 'ida'
        });
        // Vuelta
        matches.push({
          homePlayer: playersArr[j],
          awayPlayer: playersArr[i],
          homeScore: null,
          awayScore: null,
          mode: 'vuelta'
        });
      }
    }
    return matches;
  };

  // Generar partidos y guardarlos en Firestore (colección "matches")
  const handleGenerateMatches = async () => {
    if (players.length < 2) {
      alert('Se necesitan al menos 2 jugadores.');
      return;
    }

    let generatedMatches = [];
    if (champMode === 'double') {
      generatedMatches = generateDoubleRoundRobin(players);
    } else {
      generatedMatches = generateSingleRoundRobin(players);
    }

    // Guardar cada partido en "matches" (podrías usar batch si prefieres)
    try {
      // Primero borrar los previos (opcional, si quieres limpiar)
      // const oldSnapshot = await getDocs(matchesColRef);
      // oldSnapshot.forEach(async (m) => {
      //   await deleteDoc(doc(db, 'matches', m.id));
      // });

      for (const match of generatedMatches) {
        await addDoc(matchesColRef, match);
      }
      alert(`Partidos generados en modo: ${champMode === 'double' ? 'Ida y Vuelta' : 'Normal'}`);
    } catch (err) {
      console.error('Error generando partidos:', err);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Administración de Jugadores (Firebase)</h1>

      <form onSubmit={handleAddPlayer} className={styles.form}>
        <input
          type="text"
          placeholder="Nombre del jugador"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="URL de la imagen (opcional)"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />
        <input
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
        />
        <button type="submit" className="btn primary">
          Agregar
        </button>
      </form>

      <h2>Lista de Jugadores</h2>
      <div className={styles.playerList}>
        {players.map((player, index) => (
          <div key={player.id} className={styles.playerCard}>
            <img src={player.imageUrl} alt={player.name} className={styles.playerImg} />
            <p><strong>{player.name}</strong></p>
            <button
              onClick={() => handleRemovePlayer(index)}
              className="btn secondary"
            >
              Eliminar
            </button>
          </div>
        ))}
      </div>

      <div className={styles.modeContainer}>
        <label className={styles.modeLabel}>Modo de Campeonato:</label>
        <select
          value={champMode}
          onChange={(e) => setChampMode(e.target.value)}
          className={styles.modeSelect}
        >
          <option value="single">Normal (Una vuelta)</option>
          <option value="double">Ida y Vuelta</option>
        </select>
      </div>

      <button
        onClick={handleGenerateMatches}
        className="btn primary"
        style={{ marginTop: '1rem' }}
      >
        Generar Partidos
      </button>

      <nav style={{ marginTop: '2rem' }}>
        <Link href="/" className="btn secondary">
          Volver al inicio
        </Link>
      </nav>
    </div>
  );
}
