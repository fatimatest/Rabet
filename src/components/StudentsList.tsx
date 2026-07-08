import React, { useEffect, useState } from "react";
import axios from "axios";

interface Student {
  id: number;
  name: string;
}

const StudentsList: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/students")
      .then(res => setStudents(res.data.students))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h2>قائمة الطلاب</h2>
      <ul>
        {students.map(s => (
          <li key={s.id}>{s.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default StudentsList;