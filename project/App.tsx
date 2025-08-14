import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Dimensions,
  StatusBar,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

interface Role {
  id: string;
  name: string;
  description: string;
  team: 'werewolf' | 'village' | 'neutral';
  icon: string;
  color: string[];
}

interface Player {
  id: number;
  name: string;
  role: Role;
}

const defaultRoles: Role[] = [
  {
    id: 'loup-bleu',
    name: 'Loup Bleu',
    description: 'Loup-garou spécial avec des pouvoirs uniques. Éliminez les villageois pendant la nuit.',
    team: 'werewolf',
    icon: 'moon',
    color: ['#2563eb', '#1d4ed8']
  },
  {
    id: 'loup-noir',
    name: 'Loup Noir',
    description: 'Loup-garou redoutable avec des capacités spéciales. Éliminez les villageois pendant la nuit.',
    team: 'werewolf',
    icon: 'skull',
    color: ['#374151', '#111827']
  },
  {
    id: 'loup',
    name: 'Loup',
    description: 'Loup-garou classique. Éliminez les villageois pendant la nuit. Gagnez quand les loups égalent les villageois.',
    team: 'werewolf',
    icon: 'moon',
    color: ['#dc2626', '#b91c1c']
  },
  {
    id: 'simple-villageois',
    name: 'Simple villageois',
    description: 'Villageois ordinaire. Trouvez et éliminez tous les loups-garous. Votez pendant le jour.',
    team: 'village',
    icon: 'person',
    color: ['#16a34a', '#15803d']
  },
  {
    id: 'seer',
    name: 'Voyante',
    description: 'Chaque nuit, découvrez la véritable identité d\'un joueur. Aidez le village à trouver les loups-garous.',
    team: 'village',
    icon: 'eye',
    color: ['#9333ea', '#7c3aed']
  },
  {
    id: 'salvateur',
    name: 'Salvateur',
    description: 'Chaque nuit, protégez un joueur des attaques de loups-garous. Sauvez une vie par nuit.',
    team: 'village',
    icon: 'heart',
    color: ['#ec4899', '#db2777']
  },
  {
    id: 'chasseur',
    name: 'Chasseur',
    description: 'Quand vous mourez, choisissez immédiatement un autre joueur à éliminer avec votre dernier souffle.',
    team: 'village',
    icon: 'locate',
    color: ['#ea580c', '#dc2626']
  },
  {
    id: 'corbeau',
    name: 'Corbeau',
    description: 'Chaque nuit, désignez un joueur qui aura deux votes contre lui le jour suivant.',
    team: 'village',
    icon: 'leaf',
    color: ['#374151', '#4b5563']
  },
  {
    id: 'sorciere',
    name: 'Sorciere',
    description: 'Possède une potion de vie et une potion de mort. Peut sauver ou tuer une fois par partie.',
    team: 'village',
    icon: 'flask',
    color: ['#8b5cf6', '#7c3aed']
  },
  {
    id: 'voleur',
    name: 'Voleur',
    description: 'Au début du jeu, choisissez votre rôle parmi deux cartes non distribuées.',
    team: 'neutral',
    icon: 'person-remove',
    color: ['#f59e0b', '#d97706']
  },
  {
    id: 'mayor',
    name: 'Maire',
    description: 'Votre vote compte pour deux votes pendant la phase de jour. Identité révélée.',
    team: 'village',
    icon: 'crown',
    color: ['#eab308', '#ca8a04']
  }
];

const teamLabels = {
  werewolf: 'Loup-garou',
  village: 'Village',
  neutral: 'Neutre'
};

const teamColors = {
  werewolf: '#fee2e2',
  village: '#dbeafe',
  neutral: '#f3f4f6'
};

const teamTextColors = {
  werewolf: '#991b1b',
  village: '#1e40af',
  neutral: '#374151'
};

export default function App() {
  const [gameState, setGameState] = useState<'setup' | 'distributing' | 'complete'>('setup');
  const [playerCount, setPlayerCount] = useState(8);
  const [roles, setRoles] = useState<Role[]>(defaultRoles);
  const [selectedRoles, setSelectedRoles] = useState<{[key: string]: number}>({
    loup: 2,
    'simple-villageois': 4,
    seer: 1,
    salvateur: 1
  });
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [showRole, setShowRole] = useState(false);
  const [editingRole, setEditingRole] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const totalSelectedRoles = Object.values(selectedRoles).reduce((sum, count) => sum + count, 0);
  const hasWerewolf = (selectedRoles['loup-bleu'] || 0) + (selectedRoles['loup-noir'] || 0) + (selectedRoles['loup'] || 0) > 0;
  const isValidSetup = totalSelectedRoles === playerCount && hasWerewolf;

  const updateRoleCount = (roleId: string, change: number) => {
    setSelectedRoles(prev => ({
      ...prev,
      [roleId]: Math.max(0, Math.min(playerCount, (prev[roleId] || 0) + change))
    }));
  };

  const startEditingRole = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    if (role) {
      setEditingRole(roleId);
      setEditingName(role.name);
    }
  };

  const saveRoleName = () => {
    if (editingRole && editingName.trim()) {
      setRoles(prev => prev.map(role => 
        role.id === editingRole 
          ? { ...role, name: editingName.trim() }
          : role
      ));
    }
    setEditingRole(null);
    setEditingName('');
  };

  const cancelEditingRole = () => {
    setEditingRole(null);
    setEditingName('');
  };

  const generatePlayers = () => {
    const rolePool: Role[] = [];
    
    Object.entries(selectedRoles).forEach(([roleId, count]) => {
      const role = roles.find(r => r.id === roleId);
      if (role) {
        for (let i = 0; i < count; i++) {
          rolePool.push(role);
        }
      }
    });

    // Shuffle roles
    for (let i = rolePool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [rolePool[i], rolePool[j]] = [rolePool[j], rolePool[i]];
    }

    const newPlayers: Player[] = [];
    for (let i = 0; i < playerCount; i++) {
      newPlayers.push({
        id: i + 1,
        name: `Joueur ${i + 1}`,
        role: rolePool[i] || roles.find(r => r.id === 'simple-villageois')!
      });
    }

    setPlayers(newPlayers);
    setGameState('distributing');
    setCurrentPlayerIndex(0);
    setShowRole(false);
  };

  const nextPlayer = () => {
    setShowRole(false);
    setTimeout(() => {
      if (currentPlayerIndex < players.length - 1) {
        setCurrentPlayerIndex(prev => prev + 1);
      } else {
        setGameState('complete');
      }
    }, 300);
  };

  const resetGame = () => {
    setGameState('setup');
    setPlayers([]);
    setCurrentPlayerIndex(0);
    setShowRole(false);
  };

  const renderSetupScreen = () => (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Ionicons name="moon" size={40} color="#fb923c" />
          <Text style={styles.title}>Loup-garou</Text>
          <Ionicons name="moon" size={40} color="#fb923c" style={{ transform: [{ scaleX: -1 }] }} />
        </View>
        <Text style={styles.subtitle}>Sélecteur de Rôles & Maître du Jeu</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="people" size={24} color="#ffffff" />
          <Text style={styles.cardTitle}>Configuration du Jeu</Text>
        </View>
        
        <View style={styles.playerCountSection}>
          <Text style={styles.sectionLabel}>Nombre de Joueurs : {playerCount}</Text>
          <View style={styles.sliderContainer}>
            <TouchableOpacity 
              onPress={() => setPlayerCount(Math.max(4, playerCount - 1))}
              style={styles.sliderButton}
            >
              <Ionicons name="remove" size={20} color="#ffffff" />
            </TouchableOpacity>
            <View style={styles.sliderTrack}>
              <Text style={styles.sliderValue}>{playerCount}</Text>
            </View>
            <TouchableOpacity 
              onPress={() => setPlayerCount(Math.min(20, playerCount + 1))}
              style={styles.sliderButton}
            >
              <Ionicons name="add" size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.rolesTitle}>Configuration des Rôles</Text>
        <View style={styles.rolesGrid}>
          {roles.map(role => (
            <View key={role.id} style={styles.roleCard}>
              <View style={styles.roleHeader}>
                <LinearGradient
                  colors={role.color}
                  style={styles.roleIcon}
                >
                  <Ionicons name={role.icon as any} size={24} color="#ffffff" />
                </LinearGradient>
                <View style={styles.roleInfo}>
                  {editingRole === role.id ? (
                    <View style={styles.editContainer}>
                      <TextInput
                        value={editingName}
                        onChangeText={setEditingName}
                        style={styles.editInput}
                        onSubmitEditing={saveRoleName}
                        autoFocus
                      />
                      <TouchableOpacity onPress={saveRoleName} style={styles.editButton}>
                        <Ionicons name="checkmark" size={16} color="#10b981" />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={cancelEditingRole} style={styles.editButton}>
                        <Ionicons name="close" size={16} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.roleNameContainer}>
                      <Text style={styles.roleName}>{role.name}</Text>
                      <TouchableOpacity onPress={() => startEditingRole(role.id)}>
                        <Ionicons name="create" size={16} color="#a855f7" />
                      </TouchableOpacity>
                    </View>
                  )}
                  <View style={[styles.teamBadge, { backgroundColor: teamColors[role.team] }]}>
                    <Text style={[styles.teamText, { color: teamTextColors[role.team] }]}>
                      {teamLabels[role.team]}
                    </Text>
                  </View>
                </View>
              </View>
              <Text style={styles.roleDescription}>{role.description}</Text>
              <View style={styles.roleCounter}>
                <Text style={styles.counterLabel}>Nombre :</Text>
                <View style={styles.counterControls}>
                  <TouchableOpacity
                    onPress={() => updateRoleCount(role.id, -1)}
                    style={[styles.counterButton, { opacity: selectedRoles[role.id] ? 1 : 0.5 }]}
                    disabled={!selectedRoles[role.id]}
                  >
                    <Text style={styles.counterButtonText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.counterValue}>{selectedRoles[role.id] || 0}</Text>
                  <TouchableOpacity
                    onPress={() => updateRoleCount(role.id, 1)}
                    style={[styles.counterButton, { opacity: (selectedRoles[role.id] || 0) < playerCount ? 1 : 0.5 }]}
                    disabled={(selectedRoles[role.id] || 0) >= playerCount}
                  >
                    <Text style={styles.counterButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.setupFooter}>
          <Text style={[styles.setupStatus, { color: totalSelectedRoles === playerCount ? '#10b981' : '#fb923c' }]}>
            Rôles Sélectionnés : {totalSelectedRoles} / {playerCount}
          </Text>
          {!isValidSetup && (
            <Text style={styles.errorText}>
              {totalSelectedRoles !== playerCount && "Veuillez sélectionner exactement le même nombre de rôles que de joueurs."}
              {!hasWerewolf && " Au moins un loup est requis."}
            </Text>
          )}
          <TouchableOpacity
            onPress={generatePlayers}
            disabled={!isValidSetup}
            style={[styles.generateButton, { opacity: isValidSetup ? 1 : 0.5 }]}
          >
            <LinearGradient
              colors={['#9333ea', '#ea580c']}
              style={styles.generateButtonGradient}
            >
              <Ionicons name="shuffle" size={20} color="#ffffff" />
              <Text style={styles.generateButtonText}>Générer les Rôles</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  const renderDistributingScreen = () => (
    <View style={styles.distributingContainer}>
      <View style={styles.distributingHeader}>
        <Text style={styles.distributingTitle}>Distribution des Rôles</Text>
        <Text style={styles.distributingSubtitle}>
          Joueur {currentPlayerIndex + 1} sur {players.length}
        </Text>
      </View>

      <View style={styles.distributingCard}>
        <Text style={styles.playerName}>{players[currentPlayerIndex].name}</Text>
        
        <TouchableOpacity
          onPress={() => setShowRole(true)}
          style={styles.roleRevealCard}
        >
          {showRole ? (
            <View style={styles.roleRevealed}>
              <LinearGradient
                colors={players[currentPlayerIndex].role.color}
                style={styles.revealedIcon}
              >
                <Ionicons 
                  name={players[currentPlayerIndex].role.icon as any} 
                  size={32} 
                  color="#ffffff" 
                />
              </LinearGradient>
              <Text style={styles.revealedRoleName}>
                {players[currentPlayerIndex].role.name}
              </Text>
              <Text style={styles.revealedDescription}>
                {players[currentPlayerIndex].role.description}
              </Text>
            </View>
          ) : (
            <View style={styles.roleHidden}>
              <View style={styles.hiddenIcon}>
                <Ionicons name="eye" size={32} color="#64748b" />
              </View>
              <Text style={styles.hiddenText}>Touchez pour révéler votre rôle</Text>
            </View>
          )}
        </TouchableOpacity>

        {showRole && (
          <TouchableOpacity onPress={nextPlayer} style={styles.nextButton}>
            <LinearGradient
              colors={['#9333ea', '#ea580c']}
              style={styles.nextButtonGradient}
            >
              <Text style={styles.nextButtonText}>
                {currentPlayerIndex < players.length - 1 ? 'Joueur Suivant' : 'Terminer la Configuration'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderCompleteScreen = () => (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.completeHeader}>
        <Text style={styles.completeTitle}>Jeu Prêt !</Text>
        <Text style={styles.completeSubtitle}>
          Tous les joueurs ont reçu leurs rôles. Le jeu peut commencer !
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.summaryTitle}>Résumé des Rôles</Text>
        <View style={styles.summaryGrid}>
          {Object.entries(selectedRoles).filter(([_, count]) => count > 0).map(([roleId, count]) => {
            const role = roles.find(r => r.id === roleId);
            if (!role) return null;
            return (
              <View key={roleId} style={styles.summaryItem}>
                <LinearGradient
                  colors={role.color}
                  style={styles.summaryIcon}
                >
                  <Ionicons name={role.icon as any} size={24} color="#ffffff" />
                </LinearGradient>
                <Text style={styles.summaryRoleName}>{role.name}</Text>
                <Text style={styles.summaryCount}>×{count}</Text>
              </View>
            );
          })}
        </View>
      </View>

      <TouchableOpacity onPress={resetGame} style={styles.resetButton}>
        <View style={styles.resetButtonContent}>
          <Ionicons name="refresh" size={20} color="#ffffff" />
          <Text style={styles.resetButtonText}>Nouvelle Partie</Text>
        </View>
      </TouchableOpacity>
    </ScrollView>
  );

  return (
    <LinearGradient
      colors={['#0f172a', '#581c87', '#0f172a']}
      style={styles.background}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      {gameState === 'setup' && renderSetupScreen()}
      {gameState === 'distributing' && renderDistributingScreen()}
      {gameState === 'complete' && renderCompleteScreen()}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 18,
    color: '#c4b5fd',
  },
  card: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 16,
    padding: 24,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#475569',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  playerCountSection: {
    marginBottom: 32,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#c4b5fd',
    marginBottom: 12,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  sliderButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#475569',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderTrack: {
    flex: 1,
    height: 40,
    backgroundColor: '#475569',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  rolesTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },
  rolesGrid: {
    gap: 16,
    marginBottom: 32,
  },
  roleCard: {
    backgroundColor: 'rgba(51, 65, 85, 0.5)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#475569',
  },
  roleHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 8,
  },
  roleIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleInfo: {
    flex: 1,
  },
  editContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  editInput: {
    flex: 1,
    backgroundColor: '#475569',
    color: '#ffffff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 14,
  },
  editButton: {
    padding: 4,
  },
  roleNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  roleName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
    flex: 1,
  },
  teamBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  teamText: {
    fontSize: 12,
    fontWeight: '500',
  },
  roleDescription: {
    fontSize: 14,
    color: '#c4b5fd',
    marginBottom: 12,
    lineHeight: 20,
  },
  roleCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  counterLabel: {
    fontSize: 14,
    color: '#c4b5fd',
  },
  counterControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  counterButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#475569',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  counterValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
    minWidth: 32,
    textAlign: 'center',
  },
  setupFooter: {
    alignItems: 'center',
  },
  setupStatus: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 16,
  },
  generateButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  generateButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 32,
    paddingVertical: 12,
  },
  generateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  distributingContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  distributingHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  distributingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  distributingSubtitle: {
    fontSize: 16,
    color: '#c4b5fd',
  },
  distributingCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#475569',
    width: width - 32,
  },
  playerName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 24,
  },
  roleRevealCard: {
    width: 240,
    height: 320,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#475569',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  roleRevealed: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  revealedIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  revealedRoleName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
    textAlign: 'center',
  },
  revealedDescription: {
    fontSize: 14,
    color: '#c4b5fd',
    textAlign: 'center',
    lineHeight: 20,
  },
  roleHidden: {
    alignItems: 'center',
  },
  hiddenIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#475569',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  hiddenText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  nextButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  nextButtonGradient: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  completeHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  completeTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  completeSubtitle: {
    fontSize: 16,
    color: '#c4b5fd',
    textAlign: 'center',
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'center',
  },
  summaryItem: {
    alignItems: 'center',
    width: (width - 80) / 4,
  },
  summaryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  summaryRoleName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 4,
  },
  summaryCount: {
    fontSize: 12,
    color: '#c4b5fd',
  },
  resetButton: {
    backgroundColor: '#475569',
    borderRadius: 12,
    marginTop: 16,
    marginBottom: 32,
  },
  resetButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});