const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🏷️ Starting to seed tags...\n');

  try {
    // Create Tags
    console.log('🏷️ Creating tags...');
    
    const tags = [
      {
        name_lo: 'ບຳລຸງຜິວ',
        name_th: 'บำรุงผิว',
        name_zh: '护肤',
        name_en: 'Skincare',
        slug: 'skincare',
      },
      {
        name_lo: 'ແຟຊັ່ນ',
        name_th: 'แฟชั่น',
        name_zh: '时尚',
        name_en: 'Fashion',
        slug: 'fashion',
      },
      {
        name_lo: 'ສຸຂະພາບ',
        name_th: 'สุขภาพ',
        name_zh: '健康',
        name_en: 'Health',
        slug: 'health',
      },
      {
        name_lo: 'ວິຕາມິນ',
        name_th: 'วิตามิน',
        name_zh: '维生素',
        name_en: 'Vitamins',
        slug: 'vitamins',
      },
      {
        name_lo: 'ຄອລລາເຈນ',
        name_th: 'คอลลาเจน',
        name_zh: '胶原蛋白',
        name_en: 'Collagen',
        slug: 'collagen',
      },
      {
        name_lo: 'ຄວາມງາມ',
        name_th: 'ความงาม',
        name_zh: '美丽',
        name_en: 'Beauty',
        slug: 'beauty',
      },
      {
        name_lo: 'ເຄື່ອງສຳອາງ',
        name_th: 'เครื่องสำอาง',
        name_zh: '化妆品',
        name_en: 'Cosmetics',
        slug: 'cosmetics',
      },
      {
        name_lo: 'ຄຳແນະນຳ',
        name_th: 'คำแนะนำ',
        name_zh: '指南',
        name_en: 'Tips',
        slug: 'tips',
      },
    ];

    const createdTags = [];
    for (const tag of tags) {
      const existing = await prisma.tag.findUnique({
        where: { slug: tag.slug },
      });

      if (existing) {
        console.log(`  ⚠️  Tag "${tag.name_en}" already exists, skipping...`);
        createdTags.push(existing);
      } else {
        const created = await prisma.tag.create({
          data: tag,
        });
        console.log(`  ✅ Created tag: ${created.name_en}`);
        createdTags.push(created);
      }
    }

    // Get existing articles to add tags
    const articles = await prisma.article.findMany();
    
    if (articles.length > 0) {
      console.log('\n🏷️ Adding tags to articles...');
      
      // Tag mappings for articles
      const articleTagMappings = [
        { slug: 'how-to-choose-perfect-skincare', tagSlugs: ['skincare', 'tips', 'beauty'] },
        { slug: 'summer-fashion-trends-2024', tagSlugs: ['fashion', 'beauty'] },
        { slug: 'benefits-of-vitamin-c-for-skin', tagSlugs: ['vitamins', 'skincare', 'health', 'beauty'] },
        { slug: 'collagen-beauty-secrets', tagSlugs: ['collagen', 'health', 'beauty', 'skincare'] },
        { slug: 'guasha-a-chinese-facial-massage-art-that-helps-revitalize-the-skin', tagSlugs: ['skincare', 'health', 'beauty', 'tips'] },
      ];

      for (const mapping of articleTagMappings) {
        const article = articles.find(a => a.slug === mapping.slug);
        if (!article) continue;

        for (const tagSlug of mapping.tagSlugs) {
          const tag = createdTags.find(t => t.slug === tagSlug);
          if (!tag) continue;

          // Check if tag is already assigned to article
          const existingAssignment = await prisma.articleTag.findUnique({
            where: {
              articleId_tagId: {
                articleId: article.id,
                tagId: tag.id,
              },
            },
          });

          if (!existingAssignment) {
            await prisma.articleTag.create({
              data: {
                articleId: article.id,
                tagId: tag.id,
              },
            });
            console.log(`  ✅ Added tag "${tag.name_en}" to article "${article.slug}"`);
          }
        }
      }
    }

    console.log('\n🎉 Tags seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - Tags: ${createdTags.length}`);
    console.log(`   - Articles tagged: ${articles.length}`);
    console.log('\n✨ Tags are now available in the admin panel!\n');
    
  } catch (error) {
    console.error('\n❌ Error seeding tags:', error);
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
