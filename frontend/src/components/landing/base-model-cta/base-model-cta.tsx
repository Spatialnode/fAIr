import styles from "./base-model-cta.module.css";
import { Button } from "@/components/ui/button/";
import { BaseModelCTAImage } from "@/assets/images";
import { Image } from "@/components/ui/image";
import { Link } from "@/components/ui/link";
import { SHARED_CONTENT, APPLICATION_ROUTES } from "@/constants";
import { ButtonVariant } from "@/enums";
import { useDialog } from "@/hooks/use-dialog";
import ContributeModelDialog from "@/features/base-models/components/contribute-model-dialog";

export const BaseModelCTA = () => {
  const { isOpened, openDialog, closeDialog } = useDialog();

  return (
    <>
      <ContributeModelDialog isOpened={isOpened} closeDialog={closeDialog} />

      <section className={`${styles.container}`}>
        <div className={styles.cta}>
          <div className={styles.ctaContent}>
            <h1>{SHARED_CONTENT.homepage.baseModelCTA.title}</h1>
            <p>{SHARED_CONTENT.homepage.baseModelCTA.description}</p>
          </div>
          <div className={styles.ctaButtonContainer}>
            <Link
              href={APPLICATION_ROUTES.BASE_MODELS_HOME}
              title={SHARED_CONTENT.homepage.baseModelCTA.secondButtonTitle}
              nativeAnchor
            >
              <Button variant={ButtonVariant.DARK}>
                {SHARED_CONTENT.homepage.baseModelCTA.secondButtonTitle}
              </Button>
            </Link>
            <Button
              className="max-w-[180px] "
              variant={ButtonVariant.SECONDARY}
              onClick={openDialog}
            >
              Contribute
            </Button>
          </div>
        </div>
        <div className={styles.imageBlock}>
          <Image
            src={BaseModelCTAImage}
            alt={SHARED_CONTENT.homepage.baseModelCTA.title}
            className={styles.image}
          />
        </div>
      </section>
    </>
  );
};
