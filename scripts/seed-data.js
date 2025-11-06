const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting to seed data...\n');

  try {
    // Get admin user
    const admin = await prisma.user.findFirst({
      where: { role: 'SUPER_ADMIN' },
    });

    if (!admin) {
      console.error('❌ No admin user found! Please create an admin user first.');
      console.log('Run: npm run create-admin\n');
      process.exit(1);
    }

    console.log(`✅ Found admin user: ${admin.email}\n`);

    // Create Categories
    console.log('📁 Creating categories...');
    
    const categories = [
      {
        slug: 'cosmetics',
        name_lo: 'ເຄື່ອງສຳອາງ',
        name_th: 'เครื่องสำอาง',
        name_zh: '化妆品',
        name_en: 'Cosmetics',
        description_lo: 'ເຄື່ອງສຳອາງຄຸນນະພາບດີ ປອດໄພ',
        description_th: 'เครื่องสำอางคุณภาพดี ปลอดภัย',
        description_zh: '高品质安全化妆品',
        description_en: 'High quality and safe cosmetics',
        order: 1,
      },
      {
        slug: 'skincare',
        name_lo: 'ບຳລຸງຜິວ',
        name_th: 'บำรุงผิว',
        name_zh: '护肤品',
        name_en: 'Skincare',
        description_lo: 'ຜະລິດຕະພັນບຳລຸງຜິວພັນ',
        description_th: 'ผลิตภัณฑ์บำรุงผิว',
        description_zh: '护肤产品',
        description_en: 'Skincare products',
        order: 2,
      },
      {
        slug: 'fashion',
        name_lo: 'ແຟຊັ່ນ',
        name_th: 'แฟชั่น',
        name_zh: '时尚',
        name_en: 'Fashion',
        description_lo: 'ເສື້ອຜ້າແລະເຄື່ອງປະດັບ',
        description_th: 'เสื้อผ้าและเครื่องประดับ',
        description_zh: '服装和配饰',
        description_en: 'Clothing and accessories',
        order: 3,
      },
      {
        slug: 'health',
        name_lo: 'ສຸຂະພາບ',
        name_th: 'สุขภาพ',
        name_zh: '健康',
        name_en: 'Health',
        description_lo: 'ຜະລິດຕະພັນເພື່ອສຸຂະພາບ',
        description_th: 'ผลิตภัณฑ์เพื่อสุขภาพ',
        description_zh: '健康产品',
        description_en: 'Health products',
        order: 4,
      },
    ];

    const createdCategories = [];
    for (const cat of categories) {
      const existing = await prisma.category.findUnique({
        where: { slug: cat.slug },
      });

      if (existing) {
        console.log(`  ⚠️  Category "${cat.name_en}" already exists, skipping...`);
        createdCategories.push(existing);
      } else {
        const created = await prisma.category.create({
          data: cat,
        });
        console.log(`  ✅ Created category: ${created.name_en}`);
        createdCategories.push(created);
      }
    }

    console.log(`\n📦 Creating products...\n`);

    // Create Products
    const products = [
      {
        categoryId: createdCategories[0].id, // Cosmetics
        slug: 'pink-lipstick',
        name_lo: 'ລິບສະຕິກສີບົວ',
        name_th: 'ลิปสติกสีชมพู',
        name_zh: '粉色口红',
        name_en: 'Pink Lipstick',
        description_lo: 'ລິບສະຕິກສີບົວສວຍ ຄົງທົນນານ ບໍ່ແຫ້ງ',
        description_th: 'ลิปสติกสีชมพูสวย ติดทนนาน ไม่แห้ง',
        description_zh: '美丽的粉色口红，持久不干',
        description_en: 'Beautiful pink lipstick, long-lasting and moisturizing',
        price: 89000,
        isFeatured: true,
        isPublished: true,
      },
      {
        categoryId: createdCategories[0].id, // Cosmetics
        slug: 'bb-cream',
        name_lo: 'ບີບີຄຣີມ',
        name_th: 'บีบีครีม',
        name_zh: 'BB霜',
        name_en: 'BB Cream',
        description_lo: 'ບີບີຄຣີມປົກປິດຂີ້ເຮັບ ກັນແດດ SPF50+',
        description_th: 'บีบีครีมปกปิดสิว กันแดด SPF50+',
        description_zh: 'BB霜遮瑕防晒 SPF50+',
        description_en: 'BB cream with coverage and SPF50+ sun protection',
        price: 150000,
        isFeatured: true,
        isPublished: true,
      },
      {
        categoryId: createdCategories[1].id, // Skincare
        slug: 'facial-serum',
        name_lo: 'ເຊຣັມບຳລຸງໜ້າ',
        name_th: 'เซรั่มบำรุงหน้า',
        name_zh: '面部精华液',
        name_en: 'Facial Serum',
        description_lo: 'ເຊຣັມບຳລຸງໜ້າ ເພີ່ມຄວາມຊຸ່ມຊື່ນ ລົບຮອຍດ່າງດຳ',
        description_th: 'เซรั่มบำรุงหน้า เพิ่มความชุ่มชื้น ลดรอยดำ',
        description_zh: '面部精华液，补水淡斑',
        description_en: 'Facial serum for hydration and dark spot reduction',
        price: 280000,
        isFeatured: true,
        isPublished: true,
      },
      {
        categoryId: createdCategories[1].id, // Skincare
        slug: 'moisturizer',
        name_lo: 'ຄຣີມບຳລຸງຜິວ',
        name_th: 'ครีมบำรุงผิว',
        name_zh: '保湿霜',
        name_en: 'Moisturizer',
        description_lo: 'ຄຣີມບຳລຸງຜິວ ເພີ່ມຄວາມຊຸ່ມຊື່ນ ໃຊ້ໄດ້ທຸກໜ້າ',
        description_th: 'ครีมบำรุงผิว เพิ่มความชุ่มชื้น ใช้ได้ทุกสภาพผิว',
        description_zh: '保湿霜，适合所有肤质',
        description_en: 'Moisturizing cream suitable for all skin types',
        price: 199000,
        isPublished: true,
      },
      {
        categoryId: createdCategories[2].id, // Fashion
        slug: 'summer-dress',
        name_lo: 'ເດຣສລະດູຮ້ອນ',
        name_th: 'เดรสฤดูร้อน',
        name_zh: '夏季连衣裙',
        name_en: 'Summer Dress',
        description_lo: 'ເດຣສລະດູຮ້ອນ ຜ້າໂຕ້ນລົມເຢັນ ສວຍງາມ',
        description_th: 'เดรสฤดูร้อน ผ้าโปร่งเย็น สวยงาม',
        description_zh: '夏季连衣裙，透气凉爽，美丽',
        description_en: 'Summer dress with breathable fabric, beautiful design',
        price: 350000,
        isFeatured: true,
        isPublished: true,
      },
      {
        categoryId: createdCategories[2].id, // Fashion
        slug: 'handbag',
        name_lo: 'ກະເປົາຖືແຟຊັ່ນ',
        name_th: 'กระเป๋าถือแฟชั่น',
        name_zh: '时尚手提包',
        name_en: 'Fashion Handbag',
        description_lo: 'ກະເປົາຖືແຟຊັ່ນ ໜັງຄຸນນະພາບດີ',
        description_th: 'กระเป๋าถือแฟชั่น หนังคุณภาพดี',
        description_zh: '时尚手提包，优质皮革',
        description_en: 'Fashion handbag with high-quality leather',
        price: 580000,
        isPublished: true,
      },
      {
        categoryId: createdCategories[3].id, // Health
        slug: 'vitamin-c',
        name_lo: 'ວິຕາມິນຊີ',
        name_th: 'วิตามินซี',
        name_zh: '维生素C',
        name_en: 'Vitamin C',
        description_lo: 'ວິຕາມິນຊີ ເສີມພູມຕ້ານທານ ບຳລຸງຜິວ',
        description_th: 'วิตามินซี เสริมภูมิคุ้มกัน บำรุงผิว',
        description_zh: '维生素C，增强免疫力，护肤',
        description_en: 'Vitamin C for immunity boost and skin care',
        price: 120000,
        isPublished: true,
      },
      {
        categoryId: createdCategories[3].id, // Health
        slug: 'collagen',
        name_lo: 'ຄອລລາເຈນ',
        name_th: 'คอลลาเจน',
        name_zh: '胶原蛋白',
        name_en: 'Collagen',
        description_lo: 'ຄອລລາເຈນ ບຳລຸງຜິວ ເສີມຄວາມງາມ',
        description_th: 'คอลลาเจน บำรุงผิว เสริมความงาม',
        description_zh: '胶原蛋白，护肤美容',
        description_en: 'Collagen for skin nourishment and beauty',
        price: 250000,
        isFeatured: true,
        isPublished: true,
      },
    ];

    for (const prod of products) {
      const existing = await prisma.product.findUnique({
        where: { slug: prod.slug },
      });

      if (existing) {
        console.log(`  ⚠️  Product "${prod.name_en}" already exists, skipping...`);
      } else {
        await prisma.product.create({
          data: {
            ...prod,
            createdById: admin.id,
            publishedAt: prod.isPublished ? new Date() : null,
          },
        });
        console.log(`  ✅ Created product: ${prod.name_en} (${prod.price?.toLocaleString()} LAK)`);
      }
    }

    console.log('\n🎉 Seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - Categories: ${createdCategories.length}`);
    console.log(`   - Products: ${products.length}`);
    console.log('\n✨ You can now view your data at:');
    console.log('   - Admin: http://localhost:3001/admin/products');
    console.log('   - Public: http://localhost:3001/products\n');
    
  } catch (error) {
    console.error('\n❌ Error seeding data:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
