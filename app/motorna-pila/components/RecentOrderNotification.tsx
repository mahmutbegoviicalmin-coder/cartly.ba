"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const NOTIFS = [
  { name: "Amir K.", city: "Bugojna", mins: 2 },
  { name: "Haris M.", city: "Sarajeva", mins: 4 },
  { name: "Adnan B.", city: "Zenice", mins: 7 },
  { name: "Mirza H.", city: "Tuzle", mins: 3 },
  { name: "Emir S.", city: "Mostara", mins: 9 },
  { name: "Kenan D.", city: "Bihaća", mins: 5 },
  { name: "Nedim L.", city: "Travnika", mins: 6 },
  { name: "Faruk P.", city: "Banje Luke", mins: 8 },
  { name: "Elvir J.", city: "Cazina", mins: 3 },
  { name: "Damir R.", city: "Doboja", mins: 5 },
  { name: "Tarik N.", city: "Visokog", mins: 4 },
  { name: "Nermin V.", city: "Konjica", mins: 6 },
];

export default function RecentOrderNotification() {
  const [shown, setShown] = useState(false);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    let i = 0;
    let hideT: ReturnType<typeof setTimeout>;
    const show = () => {
      setIdx(i % NOTIFS.length);
      i += 1;
      setShown(true);
      hideT = setTimeout(() => setShown(false), 5600);
    };
    const start = setTimeout(show, 5000);
    const loop = setInterval(show, 18000);
    return () => {
      clearTimeout(start);
      clearTimeout(hideT);
      clearInterval(loop);
    };
  }, []);

  const o = NOTIFS[idx];

  return (
    <AnimatePresence>
      {shown && (
        <motion.aside
          className="mp-toast"
          initial={{ x: "-110%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "-110%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 32 }}
          aria-live="polite"
        >
          <div className="mp-toast-ava" aria-hidden="true">{o.name[0]}</div>
          <div className="mp-toast-body">
            <p>
              <strong>{o.name}</strong> je naručio iz {o.city}
            </p>
            <time>prije {o.mins} min</time>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
