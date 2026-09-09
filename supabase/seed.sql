-- ============================================================
-- DATOS DE DEMOSTRACIÓN
-- COFFEE SHOP
-- ============================================================

-- COMPRADORES
INSERT INTO compradores (nombre_completo, email)
VALUES
    ('Mariann Sugge', 'msugge0@macromedia.com'),
    ('Konstance Dallimare', 'kdallimare1@qq.com'),
    ('Johann Bakeup', 'jbakeup2@pbs.org'),
    ('Merrile Ibell', 'mibell3@jimdo.com'),
    ('Kristel McWhannel', 'kmcwhannel4@youku.com'),
    ('Angele Hagger', 'ahagger5@reverbnation.com'),
    ('Enrica MacDearmont', 'emacdearmont6@topsy.com'),
    ('Irvin Shillaker', 'ishillaker7@cbsnews.com'),
    ('Rosabella Shulver', 'rshulver8@dagondesign.com'),
    ('Cchaddie Keneford', 'ckeneford9@behance.net');


-- PRODUCTOS
INSERT INTO productos (
    nombre,
    precio,
    stock,
    imagen_url
)
VALUES
    (
        'Café Americano',
        6500.00,
        15,
        'http://127.0.0.1:54321/storage/v1/object/public/productos/cafe-americano.jpg'
    ),
    (
        'Espresso',
        5000.00,
        12,
        'http://127.0.0.1:54321/storage/v1/object/public/productos/espresso.jpg'
    ),
    (
        'Cappuccino',
        8500.00,
        8,
        'http://127.0.0.1:54321/storage/v1/object/public/productos/cappuccino.jpg'
    ),
    (
        'Café Latte',
        9000.00,
        3,
        'http://127.0.0.1:54321/storage/v1/object/public/productos/cafe-latte.jpg'
    ),
    (
        'Café Mocha',
        10000.00,
        7,
        'http://127.0.0.1:54321/storage/v1/object/public/productos/cafe-mocha.jpg'
    ),
    (
        'Chocolate Caliente',
        8000.00,
        6,
        'http://127.0.0.1:54321/storage/v1/object/public/productos/chocolate-caliente.jpg'
    ),
    (
        'Té Chai',
        7000.00,
        2,
        'http://127.0.0.1:54321/storage/v1/object/public/productos/te-chai.jpg'
    ),
    (
        'Croissant de Mantequilla',
        6000.00,
        10,
        'http://127.0.0.1:54321/storage/v1/object/public/productos/croissant-mantequilla.jpg'
    ),
    (
        'Muffin de Arándanos',
        7500.00,
        4,
        'http://127.0.0.1:54321/storage/v1/object/public/productos/muffin-arandanos.jpg'
    ),
    (
        'Cheesecake de Café',
        11000.00,
        9,
        'http://127.0.0.1:54321/storage/v1/object/public/productos/cheesecake-cafe.jpg'
    );