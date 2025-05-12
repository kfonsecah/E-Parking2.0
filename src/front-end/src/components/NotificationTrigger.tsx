import { useEffect, useRef, useState } from "react";
import { useNotify } from "@/components/NotificationProvider";

export const NotificationTrigger = () => {
    const notify = useNotify();
    const [lastNoteId, setLastNoteId] = useState<number | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const fetchNotes = async () => {
            try {
                const res = await fetch("/api/notes");
                const data = await res.json();

                if (data.ok && data.notas.length > 0) {
                    const latestNote = data.notas[0];

                    // Solo notificar si es una nueva nota
                    if (lastNoteId === null || latestNote.id !== lastNoteId) {
                        setLastNoteId(latestNote.id);
                        notify(`📝 Nueva nota de ${latestNote.usuario}: ${latestNote.contenido}`);
                    }
                }
            } catch (error) {
                console.error("❌ Error fetching notes:", error);
            }
        };

        // Llamada inicial para evitar el retraso del primer intervalo
        fetchNotes();

        // Intervalo para verificar nuevas notas cada 5 segundos
        intervalRef.current = setInterval(fetchNotes, 5000);

        // Limpieza al desmontar
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [notify, lastNoteId]);

    return null;
};
