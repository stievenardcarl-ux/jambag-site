<?php
/* Réception des demandes du formulaire "Composez votre soirée" de jambag.fr.
   Chaque demande est envoyée par e-mail à l'adresse $DEST. */
$DEST = 'carl@jambag.fr';     // boîte qui reçoit les demandes
$FROM = 'hello@jambag.fr';    // expéditeur technique : une adresse existante du domaine

header('Content-Type: application/json; charset=utf-8');
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo json_encode(array('ok'=>false)); exit; }

function champ($k, $max = 300) {
  $v = isset($_POST[$k]) ? $_POST[$k] : '';
  if (is_array($v)) { $v = implode(', ', $v); }
  $v = trim(strip_tags((string)$v));
  return function_exists('mb_substr') ? mb_substr($v, 0, $max, 'UTF-8') : substr($v, 0, $max);
}
function ligne($v) { return trim(preg_replace('/[\r\n]+/', ' ', $v)); }

if (champ('site_web') !== '') { echo json_encode(array('ok'=>true)); exit; }   // champ piège anti-robots

/* Anti-robots 2 : le formulaire doit avoir été rempli dans un vrai navigateur, en plus de 6 secondes */
$t0 = champ('jb_t0', 20); $t = (int)champ('jb_t', 20);
if (champ('jb_k', 20) !== 'jb-'.((int)$t0 % 997) || $t < 6000) { echo json_encode(array('ok'=>true)); exit; }

/* Anti-spam 3 : contenu suspect -> la demande arrive quand même, mais marquée [Spam probable] */
$suspect = false;
foreach (array('prenom','nom','conjoint','tel','societe','ville','salle','lieu') as $k) {
  $v = champ($k);
  if (preg_match('~(https?://|www\.|\.com\b|\.ru\b)~i', $v)) { $suspect = true; }
  if (preg_match('/[\x{0400}-\x{04FF}\x{4E00}-\x{9FFF}]/u', $v)) { $suspect = true; }
}
$tel = champ('tel');
if ($tel !== '' && preg_match_all('/\d/', $tel) < 6) { $suspect = true; }
if (preg_match('/^(\d{4})-/', champ('date'), $mm) && (int)$mm[1] < (int)date('Y')) { $suspect = true; }
if (champ('nom') !== '' && champ('nom') === champ('tel')) { $suspect = true; }

$nom = trim(ligne(champ('prenom')).' '.ligne(champ('nom'))); $email = ligne(champ('email'));
$conjoint = ligne(champ('conjoint'));
$partiel = champ('partial', 2) === '1';   // demande commencée mais pas envoyée
$emailOk = (bool)filter_var($email, FILTER_VALIDATE_EMAIL);
if ($partiel) {
  if (!$emailOk && preg_match_all('/\d/', champ('tel')) < 6) { echo json_encode(array('ok'=>true)); exit; }
} elseif ($nom === '' || !$emailOk) { http_response_code(422); echo json_encode(array('ok'=>false)); exit; }

$date = champ('date');
if (preg_match('/^(\d{4})-(\d{2})-(\d{2})$/', $date, $m)) { $date = $m[3].'/'.$m[2].'/'.$m[1]; }

$infos = array(
  "Type d'événement" => ligne(champ('type')),
  'Moments' => ligne(champ('moments')),
  'Ambiance' => ligne(champ('ambiance')),
  'Formule envisagée' => ligne(champ('formule')),
  'Date' => $date,
  'Ville' => ligne(champ('ville')),
  'Lieu' => ligne(champ('salle')) !== '' ? ligne(champ('salle')) : ligne(champ('lieu')),
  "Nombre d'invités" => ligne(champ('invites')),
  'Durée souhaitée' => ligne(champ('duree')),
  'Technique sur place' => ligne(champ('technique')),
  'Budget envisagé' => ligne(champ('budget')),
  'Chansons ou artistes' => ligne(champ('chansons')),
  'Nom' => $nom,
  'Futur(e) marié(e)' => $conjoint,
  'Société' => ligne(champ('societe')),
  'E-mail' => $email,
  'Téléphone' => ligne(champ('tel')),
  'Nous a connus par' => ligne(champ('source')),
);
$corps = $partiel ? "Demande commencée sur jambag.fr mais pas envoyée jusqu'au bout. Un appel peut la débloquer.\n\n" : "Nouvelle demande reçue depuis jambag.fr\n\n";
if (champ('langue', 5) === 'en') { $corps .= "Langue : anglais\n"; }
foreach ($infos as $k => $v) { if ($v !== '') { $corps .= $k.' : '.$v."\n"; } }
$msg = champ('message', 5000);
if ($msg !== '') { $corps .= "\nLeur message :\n".$msg."\n"; }
$corps .= "\nPour répondre, il suffit de répondre à cet e-mail.\n";

$sujet = ($suspect ? '[Spam probable] ' : '').($partiel ? '[Demande incomplète] ' : '').'Demande JamBag : '.ligne(champ('type')).' ('.($conjoint !== '' ? ligne(champ('prenom')).' & '.$conjoint.' '.ligne(champ('nom')) : $nom).')'.(ligne(champ('ville')) !== '' ? ' à '.ligne(champ('ville')) : '');
$h  = 'From: JamBag <'.$FROM.">\r\n";
if ($emailOk) { $h .= 'Reply-To: '.$email."\r\n"; }
$h .= "MIME-Version: 1.0\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: 8bit\r\n";
$ok = mail($DEST, '=?UTF-8?B?'.base64_encode($sujet).'?=', $corps, $h);
if (!$ok) { http_response_code(500); }
echo json_encode(array('ok'=>(bool)$ok));
