import { CreativeCommonsBadge } from "@/assets/images";
import { Image } from "@/components/ui/image";
import { Link } from "@/components/ui/link";
import {
  APPLICATION_ROUTES,
  HOT_PRIVACY_POLICY_URL,
  SHARED_CONTENT,
} from "@/constants";
import {
  FacebookIcon,
  GitHubIcon,
  InstagramIcon,
  XIcon,
  YouTubeIcon,
} from "@/assets/svgs";
import { MadeWithLove } from "@/components/shared";
import { footerLinks } from "@/constants/general";

const socials = [
  {
    name: "Facebook",
    url: "https://www.facebook.com/hotosm",
    logo: FacebookIcon,
  },
  {
    name: "X",
    url: "https://twitter.com/hotosm/",
    logo: XIcon,
  },
  {
    name: "GitHub",
    url: "https://github.com/hotosm/fair",
    logo: GitHubIcon,
  },
  {
    name: "YouTube",
    url: "https://www.youtube.com/user/hotosm",
    logo: YouTubeIcon,
  },
  {
    name: "Instagram",
    url: "https://www.instagram.com/hot.osm/",
    logo: InstagramIcon,
  },
];

type FooterProps = {
  variant?: "default" | "dashboard";
};

const DashboardFooter = () => {
  const dashboardLinks = [
    {
      title: "Learn",
      route: APPLICATION_ROUTES.LEARN_BASE,
      isExternalLink: false,
    },
    {
      title: "About",
      route: APPLICATION_ROUTES.ABOUT,
      isExternalLink: false,
    },
    {
      title: "Privacy Policy",
      route: HOT_PRIVACY_POLICY_URL,
      isExternalLink: true,
    },
  ];

  return (
    <footer className="bg-off-white border-t border-gray-border">
      <div className="app-padding min-h-14 py-3 flex flex-col gap-y-3 lg:gap-y-0 lg:flex-row lg:items-center lg:justify-between">
        <ul className="flex items-center gap-x-4 self-start lg:self-auto">
          {socials.map((media) => (
            <li key={media.name}>
              <Link href={media.url} title={media.name} blank disableLinkStyle>
                <Image
                  src={media.logo}
                  alt={`${media.name} Icon`}
                  title={`${media.name}`}
                  className="h-4 w-4 opacity-80 hover:opacity-100"
                />
              </Link>
            </li>
          ))}
        </ul>

        <MadeWithLove />

        <ul className="flex items-center gap-x-6 self-start lg:self-auto">
          {dashboardLinks.map((route) => (
            <li key={route.title}>
              <Link
                href={route.route}
                title={route.title}
                nativeAnchor={route.isExternalLink}
                blank={route.isExternalLink}
                disableLinkStyle
                className="text-body-3 text-dark hover:text-primary"
              >
                {route.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
};
export const Footer = ({ variant = "default" }: FooterProps) => {
  if (variant === "dashboard") {
    return <DashboardFooter />;
  }
  return (
    <footer>
      <div className="grid grid-cols-12 grid-rows-2 gap-y-[67px] app-padding bg-dark text-white py-[77px]">
        <div className="col-span-12 grid grid-cols-8 lg:grid-cols-12  gap-x-[40px] gap-y-[40px]">
          <div className="col-span-8 lg:col-span-4">
            <p className="text-body-1">{SHARED_CONTENT.footer.title}</p>
          </div>
          <div className="col-span-8 text-body-2 flex  lg:col-start-7 lg:col-span-4  w-full justify-between">
            <ul className="space-y-4">
              {footerLinks.groupOne
                .filter((link) => link.active)
                .map((route, id) => (
                  <li key={`footer-link-${id}`}>
                    <Link
                      href={route.route}
                      title={route.title}
                      className="!text-white capitalize"
                      nativeAnchor={false}
                    >
                      {route.title}
                    </Link>
                  </li>
                ))}
            </ul>

            <ul className="space-y-4">
              {footerLinks.groupTwo
                .filter((link) => link.active)
                .map((route, id) => (
                  <li key={`footer-links2-${id}`}>
                    <Link
                      href={route.route}
                      title={route.title}
                      className="!text-white capitalize"
                      nativeAnchor={route.isExternalLink}
                      blank={route.isExternalLink}
                    >
                      {route.title}
                    </Link>
                  </li>
                ))}
            </ul>
          </div>
        </div>
        <div className="col-span-12 grid grid-cols-8 lg:grid-cols-12 lg:grid-rows-1 gap-x-[40px] gap-y-[40px] lg:gap-y-0">
          <div className="col-span-8 lg:col-span-4 flex flex-col gap-y-5">
            <div>
              <Image
                src={CreativeCommonsBadge}
                alt="Creative Commons Badge"
                title="Creative Commons Badge"
              />
            </div>
            <div className="space-y-5 text-body-3">
              <p>{SHARED_CONTENT.footer.copyright.firstSegment}</p>
              <p>{SHARED_CONTENT.footer.copyright.secondSegment}</p>
            </div>
          </div>
          <div className="col-span-8 flex flex-col lg:col-start-10 lg:col-span-4 w-full justify-start items-start lg:justify-end lg:items-end space-y-4">
            <ul className="flex space-x-[11px]">
              {socials.map((media, id) => (
                <li
                  key={`social-link-${id}`}
                  className="w-7 h-7 flex  items-center justify-center bg-white rounded-full"
                >
                  <Link href={media.url} title={media.name} blank>
                    <Image
                      src={media.logo}
                      alt={`${media.name} Icon`}
                      title={`${media.name}`}
                    />
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href={"https://osm.org/about"}
              title={SHARED_CONTENT.footer.socials.ctaText}
              blank
              className="!normal-case text-body-3 !text-white"
            >
              <p>{SHARED_CONTENT.footer.socials.ctaText}</p>
            </Link>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center bg-white w-full h-[56px]">
        <MadeWithLove />
      </div>
    </footer>
  );
};
