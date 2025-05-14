# Guide de Migration - Interface Projet

Ce document explique les modifications apportées à l'interface de gestion de projets dans Metrify-Automation.

## Modifications principales

L'ancienne interface projet a été remplacée par une nouvelle interface plus puissante intégrant les fonctionnalités suivantes:

1. **Visualisation des plans DWG** - Chargement et visualisation de plans au format DWG 
2. **Identification automatique des éléments** - Détection des portes, fenêtres, murs et pièces
3. **Calcul de surfaces** - Calcul automatique des surfaces des pièces
4. **Association d'ouvrages** - Association des ouvrages aux surfaces identifiées
5. **Gestion avancée des métrés** - Interface intuitive pour la gestion des quantités et prix

## Nouveaux composants

Les nouveaux composants implémentés sont:

- `Header.tsx` - Barre supérieure avec les actions globales du projet
- `LeftPanel.tsx` - Panneau gauche listant les ouvrages du projet et la bibliothèque
- `CentralPanel.tsx` - Affichage central du plan avec outils de calibration
- `RightPanel.tsx` - Panneau droit avec récapitulatif des métrés et export
- `NewProjectModal.tsx` - Modal pour la création de nouveaux projets
- `PlanSelector.tsx` - Sélecteur de plans pour projets multi-plans

## Comment utiliser la nouvelle interface

1. **Créer un projet** - Cliquez sur "Nouveau projet" pour créer un projet
2. **Importer un plan** - Importez un fichier DWG (format AutoCAD) 
3. **Calibrer le plan** - Suivez les étapes de calibration pour identifier les éléments
4. **Sélectionner des surfaces** - Cliquez sur les pièces pour créer des surfaces
5. **Ajouter des ouvrages** - Utilisez l'onglet "Bibliothèque" pour ajouter des ouvrages
6. **Exporter** - Utilisez le bouton "Exporter Excel" pour générer un rapport détaillé

## Dépendances techniques ajoutées

- `fabric.js` - Pour la manipulation du canvas et affichage des éléments
- `xlsx` - Pour l'export des données au format Excel

## Compatibilité

Cette nouvelle interface remplace complètement l'ancienne. Les fichiers supprimés sont:
- `components/project/ProjectLayout.tsx`
- `components/project/ProjectToolbar.tsx`
- `components/project/OuvragesPanel.tsx`
- `components/project/PlanViewer.tsx`
- `components/project/AssociationsPanel.tsx`

## Migration des données

Si vous aviez des projets existants, leurs données restent compatibles avec la nouvelle interface. Les métrés existants seront toujours accessibles et modifiables.

## Problèmes connus

- Les fichiers DWG très complexes peuvent prendre du temps à charger
- L'identification automatique peut nécessiter des ajustements manuels
- La compatibilité mobile est limitée 