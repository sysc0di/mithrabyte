"use client";
import { useTranslations } from "next-intl";
import styles from "./contact.module.css";
import { MdLocationOn, MdPhone, MdEmail, MdAccessTime } from "react-icons/md";
export default function Contact() {
 /* const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      message: "",
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .min(2, "En az 2 karakter olmalı")
        .required("İsim zorunlu"),
      email: Yup.string()
        .email("Geçerli bir e-posta giriniz")
        .required("E-posta zorunlu"),
      message: Yup.string()
        .min(10, "En az 10 karakter olmalı")
        .required("Mesaj zorunlu"),
    }),
    onSubmit: (values, { resetForm }) => {
      alert(`Mesajınız gönderildi!\n\n${JSON.stringify(values, null, 2)}`);
      resetForm();
    },
  });*/

    const t = useTranslations("contact");


  return (
    <main className={styles.container}>
      <section className={styles.left}>
      {/*  <h2 className={styles.title}>Bize Ulaşın</h2>
        <form onSubmit={formik.handleSubmit} noValidate>
          <div className={styles.formGroup}>
            <label htmlFor="name" className={styles.label}>İsim</label>
            <input
              id="name"
              name="name"
              type="text"
              className={styles.input}
              placeholder="Adınız"
              {...formik.getFieldProps("name")}
            />
            {formik.touched.name && formik.errors.name ? (
              <div style={{ color: "tomato", marginTop: "0.25rem", fontSize: "0.9rem" }}>
                {formik.errors.name}
              </div>
            ) : null}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>E-posta</label>
            <input
              id="email"
              name="email"
              type="email"
              className={styles.input}
              placeholder="ornek@mail.com"
              {...formik.getFieldProps("email")}
            />
            {formik.touched.email && formik.errors.email ? (
              <div style={{ color: "tomato", marginTop: "0.25rem", fontSize: "0.9rem" }}>
                {formik.errors.email}
              </div>
            ) : null}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="message" className={styles.label}>Mesajınız</label>
            <textarea
              id="message"
              name="message"
              rows="5"
              className={styles.textarea}
              placeholder="Mesajınızı yazınız..."
              {...formik.getFieldProps("message")}
            />
            {formik.touched.message && formik.errors.message ? (
              <div style={{ color: "tomato", marginTop: "0.25rem", fontSize: "0.9rem" }}>
                {formik.errors.message}
              </div>
            ) : null}
          </div>

          <button type="submit" className={styles.formbutton}>Gönder</button>
        </form>*/}
      </section>

            <section className={styles.right}>
        <h2 className={styles.title}>{t("title")}</h2>

        <div className={styles.infoItem}>
          <span className={styles.infoIcon}><MdLocationOn/></span>
          <span>{t("address")}</span>
        </div>

        <div className={styles.infoItem}>
          <span className={styles.infoIcon}><MdPhone/></span>
          <span>{t("phone")}</span>
        </div>

        <div className={styles.infoItem}>
          <span className={styles.infoIcon}><MdEmail/></span>
          <span>{t("email")}</span>
        </div>

        <div className={styles.infoItem}>
          <span className={styles.infoIcon}><MdAccessTime/></span>
          <span>{t("hours")}</span>
        </div>
      </section>

    </main>
  );
}
