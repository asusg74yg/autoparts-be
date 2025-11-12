import { PrismaClient } from '@prisma/client';
const cmsSeed = [
  {
    slug: 'about-us',
    title: 'About Us',
    status: 'PUBLISHED',
    content: 'Here is the content of the About Us',
  },
  {
    slug: 'contact-us',
    title: 'Contact Us',
    status: 'PUBLISHED',
    content: 'Here is the content of the Contact Us',
  },
  {
    slug: 'privacy-policy',
    title: 'Privacy Policy',
    status: 'PUBLISHED',
    content: 'Here is the content of the Privacy Policy',
  },
  {
    slug: 'terms-and-conditions',
    title: 'Terms and Conditions',
    status: 'PUBLISHED',
    content: 'Here is the content of the Terms and Conditions',
  },
  {
    slug: 'faq',
    title: 'FAQ',
    status: 'PUBLISHED',
    content: 'Here is the content of the FAQ',
  },

  {
    slug: 'newsletter',
    title: 'News letter',
    status: 'PUBLISHED',
    content: 'Here is the content of the News letter',
  },
];
const prisma = new PrismaClient();
async function main() {
  // Upsert CMS seed data
  for (const cmsData of cmsSeed) {
    await prisma.cmsPage.upsert({
      where: { slug: cmsData.slug },
      update: {},
      create: {
        slug: cmsData.slug,
        title: cmsData.title,
        content: cmsData.content,
        status: cmsData.status as any,
      },
    });
    console.log(`✓ Upserted CMS page: ${cmsData.title} (${cmsData.slug})`);
  }
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
