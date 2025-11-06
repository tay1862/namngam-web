'use client';

import { useLocale } from 'next-intl';
import { Locale } from '@/i18n';

const content = {
  lo: {
    title: 'ກ່ຽວກັບ NAMNGAM',
    story: {
      title: 'ເລື່ອງລາວຂອງພວກເຮົາ',
      paragraph1: 'NAMNGAM ORIGINAL ເປັນແບຣນທີ່ມຸ່ງໝັ້ນໃນການນຳສະເໜີສິນຄ້າທີ່ມີຄຸນນະພາບ ແລະ ການບໍລິການທີ່ດີທີ່ສຸດໃຫ້ກັບລູກຄ້າທຸກທ່ານ.',
      paragraph2: 'ພວກເຮົາເຊື່ອວ່າ ຄຸນນະພາບແລະຄວາມງາມທີ່ແທ້ຈິງ ແມ່ນສິ່ງທີ່ທຸກຄົນສົມຄວນໄດ້ຮັບ.',
    },
    values: [
      {
        icon: '💎',
        title: 'ຄຸນນະພາບ',
        description: 'ສິນຄ້າທຸກຊິ້ນຜ່ານການຄັດເລືອກຢ່າງພິຖີພິຖັນ',
      },
      {
        icon: '✨',
        title: 'ຄວາມງາມ',
        description: 'ອອກແບບສວຍງາມ ທັນສະໄໝ',
      },
      {
        icon: '🤝',
        title: 'ບໍລິການ',
        description: 'ພ້ອມໃຫ້ຄຳປຶກສາ ດ້ວຍຄວາມເປັນມິດ',
      },
    ],
  },
  th: {
    title: 'เกี่ยวกับ NAMNGAM',
    story: {
      title: 'เรื่องราวของเรา',
      paragraph1: 'NAMNGAM ORIGINAL เป็นแบรนด์ที่มุ่งมั่นในการนำเสนอสินค้าที่มีคุณภาพ และการบริการที่ดีที่สุดให้กับลูกค้าทุกท่าน',
      paragraph2: 'เราเชื่อว่า คุณภาพและความงามที่แท้จริง คือสิ่งที่ทุกคนสมควรได้รับ',
    },
    values: [
      {
        icon: '💎',
        title: 'คุณภาพ',
        description: 'สินค้าทุกชิ้นผ่านการคัดสรรอย่างพิถีพิถัน',
      },
      {
        icon: '✨',
        title: 'ความงาม',
        description: 'ออกแบบสวยงาม ทันสมัย',
      },
      {
        icon: '🤝',
        title: 'บริการ',
        description: 'พร้อมให้คำปรึกษา ด้วยความเป็นมิตร',
      },
    ],
  },
  zh: {
    title: '关于 NAMNGAM',
    story: {
      title: '我们的故事',
      paragraph1: 'NAMNGAM ORIGINAL 是一个致力于为每一位客户提供优质产品和最佳服务的品牌。',
      paragraph2: '我们相信，真正的品质和美丽是每个人都应该拥有的。',
    },
    values: [
      {
        icon: '💎',
        title: '品质',
        description: '每件产品都经过精心挑选',
      },
      {
        icon: '✨',
        title: '美丽',
        description: '设计精美，时尚现代',
      },
      {
        icon: '🤝',
        title: '服务',
        description: '友好地提供咨询服务',
      },
    ],
  },
  en: {
    title: 'About NAMNGAM',
    story: {
      title: 'Our Story',
      paragraph1: 'NAMNGAM ORIGINAL is a brand committed to presenting quality products and the best service to all our customers.',
      paragraph2: 'We believe that true quality and beauty are what everyone deserves.',
    },
    values: [
      {
        icon: '💎',
        title: 'Quality',
        description: 'Every product is carefully selected',
      },
      {
        icon: '✨',
        title: 'Beauty',
        description: 'Beautiful design, modern style',
      },
      {
        icon: '🤝',
        title: 'Service',
        description: 'Ready to provide friendly consultation',
      },
    ],
  },
};

export default function AboutSection() {
  const locale = useLocale() as Locale;
  const t = content[locale] || content.lo;

  return (
    <section className="section-padding bg-gradient-to-br from-pink-50 via-white to-pink-50">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-heading font-bold mb-12 text-center bg-gradient-to-r from-pink-500 to-pink-600 bg-clip-text text-transparent">
            {t.title}
          </h2>
          
          <div className="prose prose-lg max-w-none">
            <div className="card mb-8">
              <h3 className="text-2xl font-semibold mb-4 text-pink-500">
                {t.story.title}
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                {t.story.paragraph1}
              </p>
              <p className="text-gray-700 leading-relaxed">
                {t.story.paragraph2}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {t.values.map((value, index) => (
                <div key={index} className="card text-center hover:shadow-lg transition-shadow">
                  <div className="text-5xl mb-4">{value.icon}</div>
                  <h4 className="font-semibold text-lg mb-2">{value.title}</h4>
                  <p className="text-gray-600 text-sm">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
