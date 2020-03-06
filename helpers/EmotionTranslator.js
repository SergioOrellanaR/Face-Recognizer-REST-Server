let emotionName = '';
switch (maxConfidence.Type) {
  case 'HAPPY':
    emotionName = 'Alegre, sigue así!';
  break;

  case 'SAD':
    emotionName = 'Triste, ya vendrán días mejores.';
  break;
  
  case 'ANGRY':
    emotionName = 'Enojado, todo va a estar bien.';
  break;
  
  case 'CONFUSED':
    emotionName = 'Confuso, confío en que podrás resolver tus dudas';
  break;
  
  case 'DISGUSTED':
    emotionName = 'No muy conforme, tienes algo que resolver?';
  break;
  
  case 'SURPRISED':
    emotionName = 'Sorprendido, así es la vida :)';
  break;
  
  case 'CALM':
    emotionName = 'Calmado, paz interior.';
  break;

  case 'UNKNOWN':
    emotionName = 'No tener ninguna emoción identificable.';
  break;

  default:
    emotionName = 'No tener ninguna emoción identificable.';
  break;
}