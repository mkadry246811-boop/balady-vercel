import React, { useState, useEffect, useRef } from 'react';
import '../styles/Header.css';
import { FaChevronDown, FaSearch } from 'react-icons/fa';
import { IoSettingsOutline } from "react-icons/io5";

const Header = () => {
    const [activeMenu, setActiveMenu] = useState(null);
    const menuRef = useRef(null);

    const toggleMenu = (index) => {
        setActiveMenu(activeMenu === index ? null : index);
    };

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setActiveMenu(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const [isScrolled, setIsScrolled] = useState(false);
    const topBarRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => {
            // Get actual top bar height dynamically
            const topBar = topBarRef.current;
            if (topBar) {
                const topBarBottom = topBar.getBoundingClientRect().bottom;
                // When top bar has scrolled out of view (its bottom <= 0)
                setIsScrolled(topBarBottom <= 0);
            } else {
                // Fallback
                setIsScrolled(window.scrollY > 100);
            }
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const menuItems = [
        {
            title: 'عن بلدي',
            subMenus: [
                {
                    title: 'عن نحن',
                    links: [
                        { text: 'من نحن', url: 'https://balady.gov.sa/ar/about-balady' },
                        { text: 'الهيكل التنظيمي', url: 'https://balady.gov.sa/ar/node/11036' },
                        { text: 'الهيكل الإستراتيجي للوزارة', url: 'https://balady.gov.sa/ar/node/11038' },
                        { text: 'السياسات والاستراتيجيات', url: 'https://balady.gov.sa/ar/node/11014' },
                        { text: 'أهداف التنمية المستدامة', url: 'https://balady.gov.sa/ar/partners' },
                        { text: 'الأنظمة واللوائح', url: 'https://balady.gov.sa/ar/partners' },
                        { text: 'الوظائف', url: 'https://balady.gov.sa/ar/node/10982' },
                        { text: 'تواصل معنا', url: 'https://balady.gov.sa/ar/node/1121' }
                    ]
                },
                {
                    title: 'المشاركة الإلكترونية',
                    links: [
                        { text: 'الاستشارات', url: 'https://balady.gov.sa/ar/node/11014' },
                        { text: 'بيان المشاركة الإلكترونية', url: 'https://balady.gov.sa/ar/node/11004' },
                        { text: 'البيانات المفتوحة', url: 'https://balady.gov.sa/ar/partners' },
                        { text: 'التغذية الراجعة', url: 'https://balady.gov.sa/ar/node/11004' },
                        { text: 'تطوير المشترك والأفكار', url: 'https://balady.gov.sa/ar/node/11014' },
                        { text: 'وسائل التواصل الاجتماعي', url: 'https://balady.gov.sa/ar/node/11217' }
                    ]
                },
                {
                    title: 'الأخبار والفعاليات',
                    links: [
                        { text: 'الأخبار', url: 'https://balady.gov.sa/ar/news' },
                        { text: 'الفعاليات', url: 'https://balady.gov.sa/ar/events-list' }
                    ]
                },
                {
                    title: 'المنافسات والميزانية',
                    links: [
                        { text: 'المنافسات والمشتريات', url: 'https://balady.gov.sa/ar/node/10981' },
                        { text: 'الميزانية والإنفاق', url: 'https://balady.gov.sa/ar/e_participation' }
                    ]
                }
            ]
        },
        {
            title: 'مركز المعرفة',
            subMenus: [
                {
                    title: 'مبادرات وشراكات',
                    links: [
                        { text: 'المبادرات', url: 'https://balady.gov.sa/ar/initiatives' },
                        { text: 'الشراكات', url: 'https://balady.gov.sa/ar/partners' },
                        { text: 'منصة استطلاع', url: 'https://istitlaa.ncc.gov.sa/ar/Municipality/momra/Pages/default.aspx' },
                        { text: 'منصة تفاعل', url: 'https://eparticipation.my.gov.sa/e-consultations/consultations/?title=&status=&type=&beneficiary=&sector=' }
                    ]
                },
                {
                    title: 'بيانات وإحصائيات',
                    links: [
                        { text: 'البيانات المفتوحة', url: 'https://balady.gov.sa/ar/e_participation/11190' },
                        { text: 'إحصائيات ومؤشرات المنصة', url: 'https://balady.gov.sa/ar/e_participation/feedback/11180' }
                    ]
                }
            ]
        },
        {
            title: 'الخدمات',
            subMenus: [
                {
                    title: 'الصفحات الشخصية',
                    links: [
                        { text: 'إدارة الطلبات', url: 'https://balady.gov.sa/services/11106' },
                        { text: 'إدارة الرخص', url: 'https://balady.gov.sa/services/11108' },
                        { text: 'لوحة التحكم', url: 'https://apps.balady.gov.sa/dashboardclient/' }
                    ]
                },
                {
                    title: 'المنظمات والأنظمة',
                    links: [
                        { text: 'منصة رسم إشغال مرافق الإيواء', url: 'https://balady.gov.sa/services/10767' },
                        { text: 'منصة رسم تقديم منتجات التبغ', url: 'https://balady.gov.sa/services/10800' },
                        { text: 'بلدي أعمال', url: 'https://balady.gov.sa/ar/products/10721' },
                        { text: 'تصنيف مقدمي خدمات المدن', url: 'https://balady.gov.sa/ar/products/10635' }
                    ]
                },
                {
                    title: 'التفويض البلدي الإلكتروني',
                    links: [
                        { text: 'إضافة منشأة إلى مدير حساب', url: 'https://balady.gov.sa/services/10794' },
                        { text: 'الاستعلام عن طلبات منشأة', url: 'https://balady.gov.sa/services/10792' },
                        { text: 'الاستعلام عن مفوضي منشأة', url: 'https://balady.gov.sa/services/10793' }
                    ]
                },
                {
                    title: 'الرخص التجارية',
                    links: [
                        { text: 'إصدار رخصة تجارية', url: 'https://balady.gov.sa/services/11010' },
                        { text: 'تجديد رخصة نشاط تجاري', url: 'https://balady.gov.sa/services/10485' },
                        { text: 'إلغاء رخصة نشاط تجاري', url: 'https://balady.gov.sa/services/10492' }
                    ]
                },
                {
                    title: 'الرخص الإنشائية',
                    links: [
                        { text: 'إصدار رخصة بناء', url: 'https://balady.gov.sa/services/10472' },
                        { text: 'خدمة إصدار رخصة تسوير أراضي فضاء', url: 'https://balady.gov.sa/services/10538' }
                    ]
                },
                {
                    title: 'الشهادات الصحية',
                    links: [
                        { text: 'إصدار شهادة صحية', url: 'https://balady.gov.sa/services/10592' },
                        { text: 'تجديد شهادة صحية', url: 'https://balady.gov.sa/services/10596' }
                    ]
                },
                {
                    title: 'خدمات تنسيق المشروعات',
                    links: [
                        { text: 'خدمات تنسيق أعمال البنية التحتية', url: '#' },
                        { text: 'خدمات تنسيق المشروعات الكبرى', url: '#' }
                    ]
                },
                {
                    title: 'خدمات التقارير المساحية',
                    links: [
                        { text: 'إصدار تقرير مساحي', url: '#' }
                    ]
                }
            ]
        },
        {
            title: 'الاستعلامات',
            subMenus: [
                {
                    title: 'الاستعلامات العامة',
                    links: [
                        { text: 'الاستعلام عن المخالفة للإجراءات الاحترازية', url: 'https://balady.gov.sa/services/11110' },
                        { text: 'حاسبة الرسوم المعلوماتية', url: 'https://balady.gov.sa/services/11112' },
                        { text: 'الاستعلام عن المكاتب الهندسية', url: 'https://balady.gov.sa/services/11114' },
                        { text: 'الاستعلام عن عقود النظافة', url: 'https://balady.gov.sa/services/11116' },
                        { text: 'أسواق المتاجر المتنقلة', url: 'https://balady.gov.sa/services/11118' },
                        { text: 'الاستعلام عن الإيقافات', url: 'https://balady.gov.sa/services/11120' },
                        { text: 'الاستعلام عن المخالفات', url: 'https://balady.gov.sa/services/11122' }
                    ]
                },
                {
                    title: 'الأراضي والبناء',
                    links: [
                        { text: 'استعلام عن رخصة بناء', url: 'https://balady.gov.sa/services/11124' },
                        { text: 'اشتراطات إيصال الخدمات الكهربائية', url: 'https://balady.gov.sa/services/11126' },
                        { text: 'المستكشف الجغرافي', url: 'https://balady.gov.sa/services/11130' },
                        { text: 'مستكشف التغطية لخدمات البنية التحتية', url: 'https://balady.gov.sa/services/11132' },
                        { text: 'الاستعلام عن قرار مساحي', url: 'https://balady.gov.sa/services/11632' }
                    ]
                },
                {
                    title: 'الاستعلامات التجارية',
                    links: [
                        { text: 'استعلام عن رخصة نشاط تجاري', url: 'https://new.balady.gov.sa/ar/services/11134' },
                        { text: 'الأنشطة التجارية والاشتراطات البلدية', url: 'https://balady.gov.sa/services/11136' },
                        { text: 'الاستعلام عن مسارات العربات المتجولة', url: 'https://balady.gov.sa/services/11138' }
                    ]
                },
                {
                    title: 'خدمات إكرام الموتى',
                    links: [
                        { text: 'الاستعلام عن مقدمي خدمات نقل وتجهيز الموتى (الجهات الخيرية)', url: 'https://balady.gov.sa/services/10488' },
                        { text: 'الاستعلام عن قبر متوفي', url: 'https://balady.gov.sa/services/10724' },
                        { text: 'طباعة شهادة دفن', url: 'https://balady.gov.sa/services/10477' },
                        { text: 'الاستعلام عن المقابر', url: 'https://balady.gov.sa/services/10729' }
                    ]
                }
            ]
        },
        {
            title: 'المنصات',
            subMenus: [
                {
                    title: 'المنصات التابعة',
                    links: [
                        { text: 'بوابة الفرص الاستثمارية', url: '#' },
                        { text: 'المنصات التفاعلية', url: '#' },
                        { text: 'منصة تحدي الاستثمار الاجتماعي للقطاع البلدي والإسكان', url: '#' }
                    ]
                }
            ]
        },
        {
            title: 'تواصل معنا',
            subMenus: [
                { title: 'اتصل بنا', links: [{ text: 'دليل الأمانات', url: '#' }] },
                { title: 'الإبلاغ عن شبهة فساد', links: [{ text: 'الدعم الفني بلغة الإشارة', url: '#' }] },
                { title: 'بلاغ عن فساد إلى (نزاهة)', links: [{ text: 'الأسئلة الشائعة', url: '#' }] },
                { title: 'وسائل التواصل الاجتماعي', links: [{ text: 'حجز موعد إلكتروني', url: '#' }] }
            ]
        }
    ];

    return (
        <div className="header-wrapper">
            {/* ===== TOP BAR ===== */}
            <div className="balady-top-bar" ref={topBarRef}>
                <div className="top-bar-content">
                    {/* Right Side: Flag + Gov Text + Verify Link */}
                    <div className="top-bar-right">
                        <img src="/saudi-flag.svg" alt="Saudi Flag" className="saudi-flag-icon" />
                        <span className="gov-text">موقع حكومي مسجل لدى هيئة الحكومة الرقمية</span>
                        <button className="verify-btn">
                            <span>كيف تتحقق</span>
                            <FaChevronDown size={10} />
                        </button>
                    </div>

                    {/* Left Side: Settings + Accessibility */}
                    <div className="top-bar-left">
                        <button className="top-bar-icon-btn">
                            <IoSettingsOutline size={16} />
                            <span>الإعدادات</span>
                        </button>
                        <button className="top-bar-icon-btn">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="5" r="3" />
                                <path d="M12 8c-3 0-5 2-5 5v1h2l1 6h4l1-6h2v-1c0-3-2-5-5-5z" />
                            </svg>
                            <span>أدوات سهولة الوصول</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* ===== MAIN HEADER ===== */}
            {/* Spacer to prevent content jump when header becomes fixed */}
            {isScrolled && <div style={{ height: '56px' }} />}
            <header className={`balady-header ${isScrolled ? 'scrolled' : ''}`} ref={menuRef}>
                <div className="header-content">
                    {/* Right: Logo */}
                    <div className="brand-logo-container">
                        <img src="/logo.svg" alt="Balady Logo" className="header-logo" />
                    </div>

                    {/* Center: Navigation Menu */}
                    <nav className="main-nav">
                        <ul className="nav-list">
                            {menuItems.map((item, index) => (
                                <li
                                    key={index}
                                    className={`nav-item ${activeMenu === index ? 'active' : ''}`}
                                >
                                    <button
                                        className="nav-link-btn"
                                        onClick={() => toggleMenu(index)}
                                    >
                                        <span>{item.title}</span>
                                        <FaChevronDown size={10} className={`chevron ${activeMenu === index ? 'rotate' : ''}`} />
                                    </button>

                                    {activeMenu === index && item.subMenus && (
                                        <div className="dropdown-menu">
                                            <div className="dropdown-content">
                                                {item.subMenus.map((sub, subIndex) => (
                                                    <div key={subIndex} className="dropdown-column">
                                                        {sub.title && <h3>{sub.title}</h3>}
                                                        <ul>
                                                            {sub.links.map((link, linkIndex) => (
                                                                <li key={linkIndex}>
                                                                    <a href={link.url} target="_blank" rel="noopener noreferrer">
                                                                        {link.text}
                                                                    </a>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </nav>

                    {/* Left: Green Button + Search + Hamburger */}
                    <div className="header-left-group">
                        <button className="action-btn">بلدي أعمال</button>

                        <button className="search-btn-header">
                            <FaSearch size={14} />
                            <span>بحث</span>
                        </button>

                        {/* Mobile Only: Hamburger */}
                        <button className="mobile-menu-btn" aria-label="Menu">
                            <span className="hamburger-line"></span>
                            <span className="hamburger-line"></span>
                            <span className="hamburger-line"></span>
                        </button>
                    </div>
                </div>
            </header>
        </div>
    );
};

export default Header;
