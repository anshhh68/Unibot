import google.generativeai as genai

genai.configure(api_key='AIzaSyCMMe58PHw9mipeKjAjiKpQTRw-UXGvcNM')

try:
    model = genai.GenerativeModel('gemini-2.0-flash-lite')
    response = model.generate_content('Say hello in one word')
    print("SUCCESS:", response.text.strip())
except Exception as e:
    print("FAILED:", str(e))
