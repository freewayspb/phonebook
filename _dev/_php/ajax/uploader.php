<?php

namespace Firstwatermark;

class Uploader
{

    // thx CertaiN http://php.net/manual/ru/features.file-upload.php

    public static function save()
    {
        header('Content-Type: text/plain; charset=utf-8');
        try {

            // Undefined | Multiple Files | $_FILES Corruption Attack
            // If this request falls under any of them, treat it invalid.
            if (
                !isset($_FILES['upload']['error']) ||
                is_array($_FILES['upload']['error'])
            ) {
                var_dump($_FILES['upload']);
                throw new \RuntimeException('Invalid parameters.');
            }

            // Check $_FILES['upload']['error'] value.
            switch ($_FILES['upload']['error']) {
                case UPLOAD_ERR_OK:
                    break;
                case UPLOAD_ERR_NO_FILE:
                    throw new \RuntimeException('No file sent.');
                case UPLOAD_ERR_INI_SIZE:
                case UPLOAD_ERR_FORM_SIZE:
                    throw new \RuntimeException('Exceeded filesize limit.');
                default:
                    throw new \RuntimeException('Unknown errors.');
            }

            // You should also check filesize here.
            if ($_FILES['upload']['size'] > 1000000) {
                throw new \RuntimeException('Exceeded filesize limit.');
            }

            // DO NOT TRUST $_FILES['upload']['mime'] VALUE !!
            // Check MIME Type by yourself.
            $finfo = new \finfo(FILEINFO_MIME_TYPE);
            if (false === $ext = array_search(
                    $finfo->file($_FILES['upload']['tmp_name']),
                    array(
                        'jpeg' => 'image/jpeg',
                        'png' => 'image/png',
                        'gif' => 'image/gif',
                    ),
                    true
                )
            ) {
                throw new \RuntimeException('Invalid file format.');
            }
            // You should name it uniquely.
            // DO NOT USE $_FILES['upload']['name'] WITHOUT ANY VALIDATION !!
            // On this example, obtain safe unique name from its binary data.

            $new_filename = sprintf(
                $_SERVER['DOCUMENT_ROOT'] . '/uploads/%s.%s',
                sha1_file($_FILES['upload']['tmp_name']),
                $ext
            );
            $file_url = sprintf(
                '/uploads/%s.%s',
                sha1_file($_FILES['upload']['tmp_name']),
                $ext
            );

            if (!move_uploaded_file(
                $_FILES['upload']['tmp_name'], 
                $new_filename)) 
            {
                throw new \RuntimeException('Failed to move uploaded file.');
            }

            $size = getimagesize($new_filename);

            echo json_encode(array('src' => $file_url, size=>$size));

        } catch (\RuntimeException $e) {

            echo $e->getMessage();

        }
    }
}

Uploader::save();