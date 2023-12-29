const express = require("express");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const cors = require("cors");
const formidable = require("formidable");
const dotenv = require("dotenv");
dotenv.config();
const app = express();

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

const transporter = nodemailer.createTransport({
  host: "smtp.office365.com", // Serveur SMTP d'Outlook
  port: 587, // Port SMTP d'Outlook
  secure: false, // false pour le port 587, true pour le port 465
  auth: {
    user: process.env.EMAIL_USER, // Use environment variable
    pass: process.env.EMAIL_PASS, // Use environment variable
  },
});

app.post("/api/send-email", (req, res) => {
  const form = new formidable.IncomingForm();

  form.parse(req, (err, fields) => {
    if (err) {
      console.error("Error parsing form data:", err);
      res
        .status(500)
        .json({ success: false, error: "Error parsing form data" });
      return;
    }

    console.log("Received form data:", fields);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_RECEIVER,
      subject: `${fields.objet}`,
      html: `
    <p style='font-size:30px'>Prénom: ${fields.prenom}</p>
    <p>Nom de famille: ${fields.nom}</p>
    <p>Âge de la victime: ${fields.age}</p>
    <p>Téléphone: ${fields.portable}</p>
    <p>E-mail: ${fields.email}</p>
    <p>Ville et région: ${fields.ville}</p>

    <p>Vous êtes:</p>

    <ul>
      <li>Victime: ${fields.victime ? "Oui" : "Non"}</li>
      <li>Parent d'une victime: ${fields.victime1 ? "Oui" : "Non"}</li>
      <li>Proche d'une victime: ${fields.victime2 ? "Oui" : "Non"}</li>
      <li>Professionnel: ${fields.victime3 ? "Oui" : "Non"}</li>
      <li>Autre: ${fields.victime4 ? "Oui" : "Non"}</li>
    </ul>

  
    <p>Résumé de la situation: ${fields.situation}</p>
    <p>Procédures judiciaires: ${fields.procedures}</p>
    <p>Suivi psychologique: ${fields.psychologique}</p>
    <p>Avocat désigné: ${fields.avocat}</p>
    <p>Aide attendue: ${fields.aide}</p>

    <p>Inscription à la newsletter: ${fields.newsletter ? "Oui" : "Non"}</p>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        res.status(500).json({
          success: false,
          error: "Erreur lors de l'envoi de l'e-mail",
        });
      } else {
        console.log("Email sent:", info.response);
        res.json({
          success: true,
          message: "E-mail envoyé avec succès",
          formData: fields,
        });
      }
    });
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
