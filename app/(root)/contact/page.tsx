"use client";

import { Mail, Phone, MapPin } from "lucide-react";
import ContactForm from "./ContactForm";

export default function ContactPage() {
  return (
    <main className="flex flex-col items-center justify-center px-6 py-16 max-w-5xl mx-auto">
      <h1 className="text-4xl font-bold text-green-600 mb-4">Contacte-nos</h1>
      <p className="text-gray-600 mb-10 text-center max-w-xl">
        Tem alguma dúvida, sugestão ou precisa de ajuda? Envie-nos uma mensagem
        e entraremos em contacto o mais breve possível.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full">
        {/* Informações de contacto */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <Mail className="text-green-600" />
            <p className="text-gray-700">biblioteca@ispi.edu.ao</p>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="text-green-600" />
            <p className="text-gray-700">+244 923 456 789</p>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="text-green-600" />
            <p className="text-gray-700">Estrada Cristo Rei, Huíla,  Lubango - Angola</p>
          </div>
            
<iframe
  src="https://www.google.com/maps?q=-14.958230418193224,13.484409623151006&hl=pt&z=17&output=embed"
  className="w-full h-[300px] rounded-lg"
  style={{ border: 0 }}
  loading="lazy"
  referrerPolicy="no-referrer-when-downgrade"
  title="Biblioteca ISPI - Lubango"
/>

</div>      
        {/* Formulário */}
        <div>
          <ContactForm />
        </div>
      </div>
    </main>
  );
}
