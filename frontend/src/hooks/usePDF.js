import { useEffect, useState } from "react";

import { deleteDocument, fetchDocuments, uploadDocuments } from "../services/pdfService";

export default function usePDF() {
  const [documents, setDocuments] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDocuments().then((items) => {
      setDocuments(items);
      setSelected(items.map((item) => item.id));
    }).catch(() => {});
  }, []);

  async function upload(files) {
    setLoading(true);
    try {
      const uploaded = await uploadDocuments(files);
      setDocuments((current) => [...uploaded, ...current]);
      setSelected((current) => [...uploaded.map((doc) => doc.id), ...current]);
    } finally {
      setLoading(false);
    }
  }

  async function remove(id) {
    await deleteDocument(id);
    setDocuments((current) => current.filter((doc) => doc.id !== id));
    setSelected((current) => current.filter((docId) => docId !== id));
  }

  return { documents, selected, setSelected, loading, upload, remove };
}
