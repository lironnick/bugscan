import axios from 'axios';

const token =
  'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImhQaEo1aWtodHVrdHZIRDgzaU5GYSJ9.eyJpbmRpdmlkdWFsSWQiOiI2ODFlMDMyMTY1ZWY2ODIxOTYwMjNiNmYiLCJlbWFpbCI6Im4wdXMrc29renRfYWRtaW4tY29tcGFueS0xQHdlYXJlaGFja2Vyb25lLmNvbSIsInVzZXJMb2NhbGUiOiJmci1GUiIsImNvbXBhbnlJZCI6IjY4MWUwMjQ2NjA0OWQxYzgzNDg4NjI3NyIsInNwZWNpYWxSb2xlcyI6IiIsImNvdW50cnkiOiJGUiIsImNvbGxhYm9yYXRvcklkIjoiZTY4Mzk0NzMtMWIxNC00ZmYwLWIzOGEtN2ExOWNkYmY3MGI2Iiwicm9sZUlkIjpudWxsLCJ1c2VyUm9sZSI6ImFkbWluIiwiaXNzIjoiaHR0cHM6Ly9sb2dpbi5wYXlmaXQuY29tLyIsInN1YiI6ImF1dGgwfDY4MWUwMzI4YjUzNjc4NjNhODdlODg2MCIsImF1ZCI6WyJodHRwczovL2FwaS5wYXlmaXQuY29tIiwiaHR0cHM6Ly9wYXlmaXQtcHJvZHVjdGlvbi5ldS5hdXRoMC5jb20vdXNlcmluZm8iXSwiaWF0IjoxNzUwNzkwNzMzLCJleHAiOjE3NTA3OTkzMzMsInNjb3BlIjoib3BlbmlkIHByb2ZpbGUgZW1haWwgb2ZmbGluZV9hY2Nlc3MiLCJhenAiOiI2Y25pRFA4TWdrQ29uZlhzeW9LcEY4MGFZdHBWRnRTWSJ9.C9618ou-zOE1kDX0i1am7vRtpgqO6lvT4246H40MZwqftcK31yoJ6KqHFtYD0OcEiog_CiG9C_j9rPRAXsIOxh1eZHuBNd4DVcNLe3XESI5fyzWwijylIUv_qHw_ITycrfPDQXSm_pz1c809BxpLzUC2S3V0jyBN0ni-Rtqqxoqe9BqE2qVDOtHtGLix0HgjJVgRuS2TF2xL0wtT-yv8uniO-3iKaJowfZ0Oxo5WmHAy0ufUfxeXzkTEaMgoG5lQLkxtfVB0r3dnQNNNNoBIr-PK6I6SWXsRkZyGa-2uwMuuMsSHVuzaVq4JiLa8ODsulYWtRDswDpFV8NwdNKaezw';
const tokenErro =
  'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImhQaEo1aWtodHVrdHZIRDgzaU5GYSJ9.eyJpbmRpdmlkdWFsSWQiOiI2ODFlMDMyMTY1ZWY2ODIxOTYwMjNiNmYiLCJlbWFpbCI6Im4wdXMrc29renRfYWRtaW4tY29tcGFueS0xQHdlYXJlaGFja2Vyb25lLmNvbSIsInVzZXJMb2NhbGUiOiJmci1GUiIsImNvbXBhbnlJZCI6IjY4MWUwMjQ2NjA0OWQxYzgzNDg4NjI3NyIsInNwZWNpYWxSb2xlcyI6IiIsImNvdW50cnkiOiJGUiIsImNvbGxhYm9yYXRvcklkIjoiZTY4Mzk0NzMtMWIxNC00ZmYwLWIzOGEtN2ExOWNkYmY3MGI2Iiwicm9sZUlkIjpudWxsLCJ1c2VyUm9sZSI6ImFkbWluIiwiaXNzIjoiaHR0cHM6Ly9sb2dpbi5wYXlmaXQuY29tLyIsInN1YiI6ImF1dGgwfDY4MWUwMzI4YjUzNjc4NjNhODdlODg2MCIsImF1ZCI6WyJodHRwczovL2FwaS5wYXlmaXQuY29tIiwiaHR0cHM6Ly9wYXlmaXQtcHJvZHVjdGlvbi5ldS5hdXRoMC5jb20vdXNlcmluZm8iXSwiaWF0IjoxNzUwNzkwNzMzLCJleHAiOjE3NTA3OTkzMzMsInNjb3BlIjoib3BlbmlkIHByb2ZpbGUgZW1haWwgb2ZmbGluZV9hY2Nlc3MiLCJhenAiOiI2Y25pRFA4TWdrQ29uZlhzeW9LcEY4MGFZdHBWRnRTWSJ9.C9618ou-zOE1kDX0i1am7vRtpgqO6lvT4246H40MZwqftcK31yoJ6KqHFtYD0OcEiog_CiG9C_j9rPRAXsIOxh1eZHuBNd4DVcNLe3XESI5fyzWwijylIUv_qHw_ITycrfPDQXSm_pz1c809BxpLzUC2S3V0jyBN0ni-Rtqqxoqe9BqE2qVDOtHtGLix0HgjJVgRuS2TF2xL0wtT-yv8uniO-3iKaJowfZ0Oxo5WmHAy0ufUfxeXzkTEaMgoG5lQLkxtfVB0r3dnQNNNNoBIr-PK6I6SWXsRkZyGa-2uwMuuMsSHVuzaVq4JiLa8ODsulYWtRDswDpFV8NwdNKae';

export async function testRequest() {
  const urlBase = ['api.payfit.com', 'app.payfit.com'];
  const tokens = [
    { name: 'token', value: token },
    { name: 'tokenErro', value: tokenErro },
  ];

  for (const url of urlBase) {
    for (const tk of tokens) {
      try {
        const { data, status } = await axios.get(`https://${url}/declaration/company/monthly`, {
          headers: {
            Authorization: `Bearer ${tk.value}`,
          },
        });

        console.log(
          `[INFO] URL: ${url} | TOKEN: ${tk.name} | STATUS: ${status === 200 || status === 201 ? '✅' : '❌'} ${status}`
        );
        console.log('[INFO] RESULT:', data);
      } catch (error: any) {
        console.log(`[ERRO] URL: ${url} | TOKEN: ${tk.name} |`, error.message);
      }
    }
  }
}
