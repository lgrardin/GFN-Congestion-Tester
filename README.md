# GFN Congestion Tester

Une extension Firefox simple pour vérifier rapidement la latence (ping) et le jitter
de votre navigateur vers quelques points de terminaison utilisés par GeForce NOW.
Utile pour évaluer la qualité réseau avant une session de cloud gaming sur le service.

**Caractéristiques**
- Mesure du ping moyen (RTT) et du jitter (écart-type) par point.
- Code couleur simple : **vert** (Bon), **orange** (Limite), **rouge** (Mauvais).
- Interface légère en popup avec icônes et thème inspiré du vert NVIDIA.

**Fichiers importants**
- **Popup et UI** : [popup.html](popup.html)
- **Styles** : [popup.css](popup.css)
- **Logique de mesure** : [popup.js](popup.js)
- **Manifest** : [manifest.json](manifest.json)
- **Icônes** : [icons/icon-48.svg](icons/icon-48.svg), [icons/icon-128.svg](icons/icon-128.svg)

**Installation (développement / test local)**
1. Ouvrir Firefox.
2. Aller à `about:debugging` → "This Firefox".
3. Cliquer sur "Load Temporary Add-on..." et sélectionner le fichier `manifest.json` du projet.
4. L'extension apparaîtra dans la barre d'outils ; cliquer sur l'icône pour ouvrir la popup.


**Comment ça marche**
- L'extension découvre automatiquement les POPs (Points of Presence) GFN via l'API NVIDIA.
- Si la découverte échoue, elle utilise une liste de fallback avec les POPs connus par région (EU, NA, APAC).
- Pour chaque serveur découvert ou disponible en fallback, elle effectue plusieurs requêtes rapides 
  (par défaut 6) et mesure le délai aller-retour (RTT).
- Les échecs ou timeouts sont ignorés ; si tous les probes vers un serveur échouent, il est marqué comme injoignable.
- Le jitter est estimé par l'écart-type des échantillons valides.
- **L'extension affiche le meilleur serveur en haut**, celui que NVIDIA vous assigne typiquement dans son app de cloud gaming.
**POPs testés (automatiquement découverts)**
L'extension teste les Points of Presence (POPs) GFN répartis globalement :
- **Europe** : Frankfurt, Paris, UK
- **North America** : US-West, US-East
- **Asia Pacific** : Japan, Singapore, South Korea
- **Fallback** : Endpoint principal GFN en cas de découverte échouée

La découverte utilise l'API interne `https://gfn.nvidia.com/api/config` qui liste les POPs réels assignés à votre région.
Si cette API est injoignable, l'extension utilise une liste de fallback mise à jour manuellement.
- Ping : Bon ≤ 40 ms — Limite ≤ 80 ms — Mauvais > 80 ms
- Jitter : Bon ≤ 8 ms — Limite ≤ 20 ms — Mauvais > 20 ms

Ces valeurs sont modifiables directement dans `popup.js` si vous souhaitez des seuils plus
stricts ou tolérants.

**Personnalisation**
- Pour tester d'autres points de terminaison (par ex. POPs GFN précis), éditez le tableau
	`servers` dans [popup.js](popup.js). Adaptez aussi les permissions dans [manifest.json](manifest.json)
	si vous ajoutez de nouveaux domaines.

Limitation importante : pour contourner certaines politiques CORS et obtenir un RTT rapide,
les requêtes utilisent `fetch` en `no-cors` (mesure d'un aller-retour HTTP simple). Selon la
configuration des serveurs et des CDN, certaines requêtes peuvent échouer ou renvoyer des
valeurs RTT approximatives. Pour des mesures réseau plus précises, un outil natif (ping ICMP)
ou un script serveur relais est recommandé.

**Tester**
- Ouvrez la popup ; la mesure démarre automatiquement. Cliquez sur "Relancer" pour refaire
	un test.

