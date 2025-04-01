import Layout from '../components/Layout';

export default function Syllabus() {
  return (
    <Layout title="Course Dashboard - Syllabus">
      <div className="tab-content active">
        <h2>RELIGST18N: What is Called Living?</h2>
        <p>TTh 1:30 - 2:50, Location Always Changing</p>
        
        <h3>People</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '20px' }}>
          {/* Instructor Information */}
          <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: '300px', backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', marginRight: '15px' }}>
              <img src="/images/rushain.jpg" alt="Professor Rushain Abbasi" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div>
              <h4 style={{ marginTop: 0, marginBottom: '5px' }}>Professor Rushain Abbasi</h4>
              <p style={{ margin: 0 }}><a href="mailto:rushain@stanford.edu" style={{ color: '#2d4059', textDecoration: 'none' }}>rushain@stanford.edu</a></p>
              <p style={{ marginTop: '5px', fontSize: '0.9em' }}>Office Hours: TBD</p>
            </div>
          </div>
          
          {/* CDA Information */}
          <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: '300px', backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', marginRight: '15px' }}>
              <img src="/images/stephanie.jpg" alt="Stephanie Cho" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div>
              <h4 style={{ marginTop: 0, marginBottom: '5px' }}>Stephanie Cho (CDA)</h4>
              <p style={{ margin: 0 }}><a href="mailto:sgcxliv@stanford.edu" style={{ color: '#2d4059', textDecoration: 'none' }}>sgcxliv@stanford.edu</a></p>
            </div>
          </div>
        </div>
        
        <h3>Description</h3>
        <p>We take the fact of living for granted, as we should. Why focus on each breath if it just comes and goes without thinking? Or so we think. But the same logic need not apply to the idea of "life" itself. For instance, we speak today of many lives: our love lives, our sex lives, the nightlife, the meaning of life, feeling alive, and so on and so forth. In this course, we will probe into these various facets of our lives today through a critical reflection on the ways we live today (and the ways we talk about life today). But we will also do so by considering how other societies, ancient and foreign (or just hidden in plain sight), have lived (and talked about life) in ways that challenge our very conception of what life entails. All of this will be facilitated through an eclectic array of activities: watching films together, reading poetry and novels, field trips (to an LSD museum or a scent shop), philosophical discussions, and collective writings/vlogging and self-examination. The purpose of this course, in short, is to introduce students to the life of the humanities--or, at the very least, what that life could be.</p>

        <h3>Grade Breakdown</h3>
        <ul>
          <li>Participation: 30%</li>
          <li>Assignments(Tasks/Projects): 30%</li>
          <li>Weekly Reflections(Recorded): 20%</li>
          <li>Midterm Dinner & Final: 20%</li>
        </ul>

        <h3>Participation</h3>
        <ul>
          <li>Each session will have a selection of either readings, a movie, and/or tasks that must be completed by the day of the class. Participation will be graded upon your showing up consistently and being prepared to think/live alongside the rest of the class over the course of the term, as well as the completion of these tasks, which are intended to facilitate our discussions. Absences will be excused in the case of emergencies, but please write to me beforehand if you won’t be able to join. 
</li>
        </ul>

         <h3>Assignments</h3>
        <ul>
          <li>There will be a total of 4 “Mini-Projects,” and 4 “Mini-Tasks” which will give you a specific task that you will complete either individually or in groups. Each of these will directly contribute to our collective endeavor. 
</li>
        </ul>
            
                 <h3>Weekly Reflections</h3>
        <ul>
          <li>These weekly voice notes (3-6 minutes) will answer the question: “What is Called ______? (e.g., Childhood, The Real World) based on some prepared reflections on the week’s experiences, discussions, and readings. 
            I will respond, in turn, which will thus facilitate our intellectual exchange (outside of the collective endeavor). Prompts will be released on the website every week. 
</li>
        </ul>
                     <h3>Exams (Final + Miderm)</h3>
        <ul>
          <li>The final exam will consist of a final task that will be commissioned to you all as a collective to be completed within the standard timespan of a final (3 hours). The Midterm is a Dinner linked to a creative writing task. If you show up and participate you will get an A. 
</li>
        </ul>
            
        <h3>Extension, Absence, and Lateness Policy</h3>
        <ul>
          <li>At the discretion of Instructor, evaluated on a case by case basis. Please email in advance to explain 
            your unique situation and arrange any necessary adjustments.</li>
        </ul>
        
        <h3>Disability & OAE</h3>
        <p>From Stanford's Office of Accessible Education:

        Stanford is committed to providing equal educational opportunities for disabled students. Disabled students are a valued and essential part of the Stanford community. We welcome you to our class.

        If you experience disability, please register with the Office of Accessible Education (OAE). Professional staff will evaluate your needs, support appropriate and reasonable accommodations, and prepare an Academic Accommodation Letter for faculty. To get started, or to re-initiate services, please visit oae.stanford.edu.

        If you already have an Academic Accommodation Letter, we invite you to share your letter with us. Academic Accommodation Letters should be shared at the earliest possible opportunity so we may partner with you and OAE to identify any barriers to access and inclusion that might be encountered in your experience of this course.</p>
      </div>
    </Layout>
  );
}
