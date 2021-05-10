<?php

// SEE https://github.com/getkirby/kirby/blob/3d580d869e44496c8b145835d4bbbbe95e7559d8/src/Toolkit/Str.php#L279-L296
$input = $argv[1] ?? '';

$encoded = '';
for ($i = 0; $i < mb_strlen($input, 'UTF-8'); $i++) {
  $char = mb_substr($input, $i, 1, 'UTF-8');
  list(, $code) = unpack('N', mb_convert_encoding($char, 'UCS-4BE', 'UTF-8'));
  $encoded .= rand(1, 2) === 1
    ? '&#' . $code . ';'
    : '&#x' . dechex($code) . ';';
}

echo $encoded;
