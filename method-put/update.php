<?php

$result = [
  'data' => [],
  'errors' => [],
  'message' => '',
  'success' => false,
];

$requestWith = $_SERVER['HTTP_X_REQUESTED_WITH'] ?? '';
$requestMethod = $_SERVER['REQUEST_METHOD'] ?? '';

if ($requestWith != 'XMLHttpRequest' || $requestMethod != 'PUT') {
  echo json_encode($result);
  exit();
}

try {
  $input = file_get_contents('php://input');
  $input = json_decode($input, true);

  if (isset($input['id']) && is_int($input['id'])) {
    $id = $input['id'];
  } else {
    $result['message'] = 'Произошла ошибка при обновлении записи. Идентификатор не был передан или он не является числом.';
  }

  if (isset($input['title']) && mb_strlen($input['title']) > 5) {
    $title = $input['title'];
  } else {
    $result['errors']['title'] = 'Поле "Модель смартфона" должна быть больше 5 символов.';
  }

  if (isset($input['price']) && (is_int($input['price']) || is_double($input['price']))) {
    $price = $input['price'];
  } else {
    $result['errors']['price'] = 'Поле "Цена" не является числом.';
  }

  if ($result['message'] || count($result['errors'])) {
    echo json_encode($result);
    exit();
  }

  $phones = json_decode(file_get_contents('data.json'), true);

  $phoneKey = false;
  foreach ($phones as $key => $phone) {
    if ($phone['id'] === $id) {
      $phoneKey = $key;
      break;
    }
  }

  if ($phoneKey !== false) {
    $phones[$phoneKey]['title'] = $title;
    $phones[$phoneKey]['price'] = $price;

    if (file_put_contents('data.json', json_encode($phones))) {
      $result['success'] = true;
    }
    $result['data'] = $phones[$phoneKey];
  }
} catch (Exception $e) {
  error_log('Caught exception: ' . $e->getMessage(), 0);
}

echo json_encode($result);
