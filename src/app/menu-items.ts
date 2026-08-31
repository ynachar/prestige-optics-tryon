export const menuItems = [
  {
    name: 'Home',
    title: 'Home Page',
    link: '/',
    subItems: [],
    active: 0
  },
  {
    name: 'Men',
    title: 'Men`s Eyewear',
    link: '/product-list/gender/M',
    banner:'https://i.ibb.co/NpP0y4s/men-Products-Banner.jpg',
    bannerText: 'Men`s Eyewear',
    subItems: [
      {
        name: 'Eyeglasses',
        title: '> Eyeglasses',
        link: '/product-list',
        banner:'https://i.ibb.co/NpP0y4s/men-Products-Banner.jpg',
        bannerText: 'Prescription',
        param: 'P/gender/M'
      },
      {
        name: 'Sunglasses',
        title: '> Sunglasses',
        link: '/product-list',
        banner:'',
        bannerText: '',
        param: 'S/gender/M'
      },
      {
        name: 'Accessories',
        title: '> Accessories',
        link: '/product-list',
        banner:'https://www.bikerseyewear.com/assets/images/sunglasses-accessories-banner-bikers-eyewear.jpg',
        bannerText: '',
        param: 'A/gender/M'
      }     
    ],
    active: 1
  },
  {
    name: 'Women',
    title: 'Women`s Eyewear',
    link: '/product-list/gender/F',
    banner:'https://i.ibb.co/vx0hdq5/women-Products-Banner.jpg',
    bannerText: 'Women`s Eyewear',
    subItems: [
      {
        name: 'Eyeglasses',
        title: '> Eyeglasses',
        link: '/product-list',
        banner:'',
        bannerText: '',
        param: 'P/gender/F'
      },
      {
        name: 'Sunglasses',
        title: '> Sunglasses',
        link: '/product-list',
        banner:'',
        bannerText: '',
        param: 'S/gender/F'
      },
      {
        name: 'Accessories',
        title: '> Accessories',
        link: '/product-list',
        banner:'',
        bannerText: '',
        param: 'A/gender/F'
      }
    ],
    active: 1
  },
  {
    name: 'Kids',
    title: 'Kids` Eyewear',
    link: '/product-list/gender/K',
    banner: 'https://i.ibb.co/TK4tpdB/kids-Products-Banner.jpg',
    bannerText: 'Kids` Eyewear',
    subItems: [
      {
        name: 'Eyeglasses',
        title: '> Eyeglasses',
        link: '/product-list',
        banner:'',
        bannerText: '',
        param: 'P/gender/K'
      },
      {
        name: 'Sunglasses',
        title: '> Sunglasses',
        link: '/product-list',
        banner:'',
        bannerText: '',
        param: 'S/gender/K'
      },
      {
        name: 'Accessories',
        title: '> Accessories',
        link: '/product-list',
        banner:'',
        bannerText: '',
        param: 'A/gender/K'
      }     
    ],
    active: 1
  },
  {
    name: 'Products',
    title: 'All Products',
    link: '/product-list',
    banner:'',
    subItems: [
      {
        name: 'Eyeglasses',
        title: '> Eyeglasses',
        link: '/product-list',
        banner:'',
        bannerText: '',
        param: 'P'
      },
      {
        name: 'Sunglasses',
        title: '> Sunglasses',
        link: '/product-list',
        banner:'',
        bannerText: '',
        param: 'S'
      },
      {
        name: 'Accessories',
        title: '> Accessories',
        link: '/product-list',
        banner:'https://www.bikerseyewear.com/assets/images/sunglasses-accessories-banner-bikers-eyewear.jpg',
        bannerText: 'sdss',
        param: 'A'
      }      
    ],
    active: 0
  },  
  {
    name: 'Clearance',
    title: '> Clearance',
    link: '/product-list/promo/all',
    banner:'https://i.ibb.co/q5CZpDf/sale-Wide-Banner.png',
    bannerText: 'Items currently on Sale.',
    subItems: [],
    active: 1
  },  
  {
    name: 'Contacts',
    title: 'Contact Lenses',
    link: '/product-list/CL',
    banner:'https://optimaxweb.glassesusa.com/image/upload/f_auto,q_auto/media/wysiwyg/lp20/contacts-desktop-category-d.png',
    bannerText: 'Contact Lenses',
    subItems: [],
    active: 1
  },
  {
    name: 'Contact Us',
    title: 'Contact Informations',
    link: '/contact-us',
    banner:'',
    bannerText: '',
    subItems: [],
    active: 1
  },
  {
    name: 'Accessories',
    title: '> Accessories',
    link: '/product-list/A',
    banner:'https://www.bikerseyewear.com/assets/images/sunglasses-accessories-banner-bikers-eyewear.jpg',
    bannerText: '',
    subItems: [],
    active: 0
  }, 
  {
    name: '',
    title: '',
    link: '',
    banner:'',
    bannerText: '',
    subItems: [],
    active: 0
  }
];