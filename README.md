# GFN Congestion Tester

Une extension Firefox / Zen Browser simple pour vérifier rapidement la latence (ping) et le jitter
de votre navigateur vers les services NVIDIA GeForce NOW.
Utile pour évaluer la qualité réseau avant une session de cloud gaming sur le service.

**Caractéristiques**
- Mesure du ping moyen (RTT) et du jitter (écart-type) des endpoints GFN publics.
- Code couleur simple : **vert** (Bon), **orange** (Limite), **rouge** (Mauvais).
- Interface légère en popup avec icônes et thème inspiré du vert NVIDIA.
- Découverte automatique des serveurs GFN accessibles.

**Fichiers importants**
- **Popup et UI** : [popup.html](popup.html)
- **Styles** : [popup.css](popup.css)
- **Logique de mesure** : [popup.js](popup.js)
- **Manifest** : [manifest.json](manifest.json)
- **Icônes** : [icons/icon-48.svg](icons/icon-48.svg), [icons/icon-128.svg](icons/icon-128.svg)

**Installation**

**Méthode recommandée : Chargement temporaire (Développement)**

1. Ouvre **Zen Browser** ou **Firefox**
2. Va à `about:debugging` dans la barre d'adresse
3. Clique sur **"This Browser"** (à gauche)
4. Clique sur **"Load Temporary Add-on..."**
5. Sélectionne le fichier `manifest.json` du projet
6. ✅ L'extension s'affiche dans la barre d'outils — clique dessus pour tester !

**À chaque modification du code :**
- Retourne à `about:debugging`
- Clique sur le bouton **"Reload"** à côté de l'extension
- La modification est appliquée immédiatement

**Comment ça marche**
- L'extension teste les endpoints publics NVIDIA GFN accessibles publiquement.
- Pour chaque serveur, elle effectue plusieurs requêtes rapides (par défaut 6) et mesure le délai aller-retour (RTT).
- Les échecs ou timeouts sont ignorés ; si tous les probes vers un serveur échouent, il est marqué comme injoignable.
- Le jitter est estimé par l'écart-type des échantillons valides.
- **L'extension affiche le serveur avec la meilleure latence en haut**, indicateur de la qualité réseau vers GFN.

**Serveurs testés**
L'extension teste ces endpoints publics NVIDIA GFN :
- **GFN Developer** (developer.geforcenow.com) - Portail développeur officiel
- **GFN Status** (status.geforcenow.com) - Page de statut des services
- **GFN API** (api.geforcenow.com) - API officielle
- **GFN Primary** (gfn.nvidia.com) - Endpoint principal

**Note** : NVIDIA garde les URLs des POPs régionaux privés. Ces endpoints publics permettent de tester la
connectivité générale vers l'infrastructure GFN. Pour des mesures précises par région, NVIDIA utilise
une sélection automatique dans son app officielle basée sur votre géolocalisation.
**Utilisation**

1. Clique sur l'icône de l'extension dans la barre d'outils
2. La popup s'ouvre et lance automatiquement les tests
3. Attends ~30 secondes pour que tous les serveurs soient testés
4. Le serveur avec la meilleure latence s'affiche en haut
5. Clique sur "Relancer" pour refaire un test

**Interprétation des résultats**
- **Vert (Bon)** : Latence basse, jitter faible → Prêt pour GFN
- **Orange (Moyen)** : Latence modérée, jitter acceptable → Utilisable
- **Rouge (Mauvais)** : Latence élevée, jitter important → Qualité réseau à vérifier

**Notes techniques**
- Les requêtes utilisent `fetch` en mode `no-cors` (mesure du RTT HTTP simple).
- NVIDIA ne publie pas les URLs des POPs régionaux — seuls les endpoints publics sont testés ici.
- Pour des mesures réseau plus précises (ICMP ping, latence par région), un outil natif est recommandé.

**Développement**

Pour modifier l'extension :
1. Éditez les fichiers (`popup.js`, `popup.css`, `popup.html`, etc.)
2. Retournez à `about:debugging` 
3. Cliquez sur **"Reload"** à côté de l'extension
4. Testez vos changements immédiatement dans le popup

Pour ajouter d'autres serveurs à tester :
- Éditez le tableau `FALLBACK_SERVERS` dans [popup.js](popup.js)
- Ajoutez les permissions correspondantes dans [manifest.json](manifest.json)
- Testez que les nouveaux serveurs répondent vraiment

**Publication future (optionnel)**
Pour distribuer l'extension plus largement :
- Signer avec `web-ext sign` (nécessite compte Mozilla)
- Publier sur le [Mozilla Add-ons Store](https://addons.mozilla.org)

Consultez le fichier [package.json](package.json) pour les scripts de build disponibles.

