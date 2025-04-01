import Layout from '../components/Layout';

export default function Calendar() {
  return (
    <Layout title="Course Dashboard - Calendar">
      <div className="tab-content active">
        <h2>Course Calendar</h2>
        <p>Below is the Course Schedule. Please note that the schedule is subject to change at any point. Make sure to regularly check this page before class as locations may change.</p>
        
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr style={{ backgroundColor: '#ddd' }}>
              <th style={{ border: '1px solid #999', padding: '4px' }}>Week</th>
              <th style={{ border: '1px solid #999', padding: '6px' }}>Date</th>
              <th style={{ border: '1px solid #999', padding: '8px' }}>Topic</th>
              <th style={{ border: '1px solid #999', padding: '8px' }}>Assignments</th>
              <th style={{ border: '1px solid #999', padding: '6px' }}>Time & Place</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ border: '1px solid #999', padding: '8px' }}>1</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>April 1st</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>Introductions</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>Living Together</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>1:30 - 2:50, Encina Center 464 </td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #999', padding: '8px' }}>1</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>April 3rd</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>Student Life</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>Bing Nursery Sign-Ups</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>1:30 - 2:50, Green Library Stacks </td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #999', padding: '8px' }}>2</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>April 8th</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>Family Matters</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>Upload a Family Photo</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>1:30 - 2:50, TBD </td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #999', padding: '8px' }}>2</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>April 10th</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>Recess</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>Play!</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>1:30 - 2:50, Meyer Green Field </td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #999', padding: '8px' }}>3</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>April 15th</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>Making a Living</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>Interview Clips</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>1:30 - 2:50, Old Union 122 </td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #999', padding: '8px' }}>3</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>April 17th</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>Work-Life Balance</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>-</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>1:30 - 2:50, TBD </td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #999', padding: '8px' }}>4</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>April 22nd</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>Nightlife</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>Signs of Nightlife</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>9:30 - 10:50 PM, Lake Lag Firepit </td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #999', padding: '8px' }}>4</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>April 24th</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>Staying Awake</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>-</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>1:30 - 2:50, TBD </td>
            </tr>
              <tr>
              <td style={{ border: '1px solid #999', padding: '8px' }}>5</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>April 29th</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>College Life</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>Love Letters/Poetry</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>1:30 - 2:50, TBD </td>
            </tr>
              <tr>
              <td style={{ border: '1px solid #999', padding: '8px' }}>5</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>May 1st</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>Personal Life</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>Love Letters/Poetry</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>1:30 - 2:50, Geology Corner Picnic Tables</td>
            </tr>
              <tr>
              <td style={{ border: '1px solid #999', padding: '8px' }}>5</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>May 2nd</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>MIDTERM</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>Dinner.</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>TBD, TBD </td>
            </tr>
              <tr>
              <td style={{ border: '1px solid #999', padding: '8px' }}>6</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>May 6th</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>Farm Life</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>Content Creation Task</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>1:30 - 2:50, O'Donohue Family Stanford Educational Farm </td>
            </tr>
              <tr>
              <td style={{ border: '1px solid #999', padding: '8px' }}>6</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>May 8th</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>Content Creation</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>Map Marking</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>1:30 - 2:50, Bowes Art & Architecture Lobby </td>
            </tr>
                <tr>
              <td style={{ border: '1px solid #999', padding: '8px' }}>7</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>May 13th</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>Campus Tour, Pt. 1</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>Wear Comforatble Shoes</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>1:30 - 2:50, TBD </td>
            </tr>
                <tr>
              <td style={{ border: '1px solid #999', padding: '8px' }}>7</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>May 15th</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>Campus Tour, Pt. 2</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>Schedule Sampling</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>1:30 - 2:50, TBD </td>
            </tr>
                  <tr>
              <td style={{ border: '1px solid #999', padding: '8px' }}>8</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>May 20th</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>Death Lecture (with Prof. Meagen Chambers)</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>-</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>1:30 - 2:50, Med School </td>
            </tr>
                    <tr>
              <td style={{ border: '1px solid #999', padding: '8px' }}>8</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>May 22nd</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>Embalmers & Morticians Panel</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>Sleep Journaling</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>1:30 - 2:50, Med School </td>
            </tr>
                      <tr>
              <td style={{ border: '1px solid #999', padding: '8px' }}>9</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>May 27th</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>When We All Fall Asleep, Where do we go?</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>Sleep Journaling</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>1:30 - 2:50, TBD </td>
            </tr>
                        <tr>
              <td style={{ border: '1px solid #999', padding: '8px' }}>9</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>May 29th</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>The Eternal Life</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>-</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>1:30 - 2:50, TBD </td>
            </tr>
                          <tr>
              <td style={{ border: '1px solid #999', padding: '8px' }}>10</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>June 3rd</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>The Good Life, or the Full Circle</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>Party</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>1:30 - 2:50, TBD </td>
            </tr>
                            <tr>
              <td style={{ border: '1px solid #999', padding: '8px' }}>10</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>TBA</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>FINAL</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>Just Be There.</td>
              <td style={{ border: '1px solid #999', padding: '8px' }}>TBA</td>
            </tr>
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
