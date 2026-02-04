
import { test, expect, _electron as electron } from '@playwright/test';

test.describe('Brain Stress Test: 15 Operations', () => {
  let app: unknown;
  let window: unknown;

  test.beforeAll(async () => {
    app = await electron.launch({ 
      args: ['dist/stage/main/index.js'],
      env: { ...process.env, NODE_ENV: 'test' }
    });
    window = await app.firstWindow();
    await window.waitForLoadState('domcontentloaded');
  });

  test.afterAll(async () => {
    await app.close();
  });

  // --- MINIMUM LOAD (Simple, Fast) ---

  test('01. Min: Simple Math', async () => {
    const result = await window.evaluate(async () => {
        // @ts-ignore
        return await window.stage.ai.ask('2+2 nedir? Sadece cevabı sayı olarak ver.');
    });
    // console.log('01. Min - Math:', result);
    expect(result).toBeDefined();
    expect(result).toContain('4');
  });

  test('02. Min: Greeting', async () => {
    const result = await window.evaluate(async () => {
        // @ts-ignore
        return await window.stage.ai.ask('Merhaba, sadece "Merhaba" de.');
    });
    // console.log('02. Min - Greeting:', result);
    expect(result).toContain('Merhaba');
  });

  test('03. Min: Capital City', async () => {
    const result = await window.evaluate(async () => {
        // @ts-ignore
        return await window.stage.ai.ask('Türkiye\'nin başkenti neresidir? Sadece şehir ismini yaz.');
    });
    // console.log('03. Min - Capital:', result);
    expect(result).toContain('Ankara');
  });

  test('04. Min: Color Mixing', async () => {
    const result = await window.evaluate(async () => {
        // @ts-ignore
        return await window.stage.ai.ask('Kırmızı ve sarı karışırsa hangi renk olur? Sadece rengi yaz.');
    });
    // console.log('04. Min - Color:', result);
    expect(result.length).toBeGreaterThan(0);
  });

  test('05. Min: Identity', async () => {
    const result = await window.evaluate(async () => {
        // @ts-ignore
        return await window.stage.ai.ask('Sen kimsin? Tek cümle.');
    });
    // console.log('05. Min - Identity:', result);
    expect(result.length).toBeGreaterThan(0);
  });

  // --- MEDIUM LOAD (Creative, Code Snippet, Explanation) ---

  test('06. Mid: Haiku', async () => {
    test.setTimeout(60000);
    const result = await window.evaluate(async () => {
        // @ts-ignore
        return await window.stage.ai.ask('Bana kodlama hakkında bir Haiku yaz.');
    });
    // console.log('06. Mid - Haiku:', result);
    expect(result.length).toBeGreaterThan(10);
  });

  test('07. Mid: Reverse Array Function', async () => {
    test.setTimeout(60000);
    const result = await window.evaluate(async () => {
        // @ts-ignore
        return await window.stage.ai.ask('JavaScript\'te array reverse fonksiyonu yaz. Sadece kodu ver.');
    });
    // console.log('07. Mid - Code:', result);
    expect(result).toContain('function');
    expect(result).toContain('return');
  });

  test('08. Mid: Photosynthesis', async () => {
    test.setTimeout(60000);
    const result = await window.evaluate(async () => {
        // @ts-ignore
        return await window.stage.ai.ask('Fotosentez nedir? 2 cümlede açıkla.');
    });
    // console.log('08. Mid - Explanation:', result);
    expect(result.length).toBeGreaterThan(20);
  });

  test('09. Mid: JSON Example', async () => {
    test.setTimeout(60000);
    const result = await window.evaluate(async () => {
        // @ts-ignore
        return await window.stage.ai.ask('Basit bir kişi (person) JSON objesi örneği ver. {name, age} içersin.');
    });
    // console.log('09. Mid - JSON:', result);
    expect(result).toContain('{');
    expect(result).toContain('}');
    expect(result).toContain('age');
  });

  test('10. Mid: Music Genres', async () => {
    test.setTimeout(60000);
    const result = await window.evaluate(async () => {
        // @ts-ignore
        return await window.stage.ai.ask('3 elektronik müzik türü listele.');
    });
    // console.log('10. Mid - List:', result);
    expect(result.length).toBeGreaterThan(10);
  });

  // --- MAXIMUM LOAD (Complex Reasoning, Long Content, System Design) ---

  test('11. Max: React Hook', async () => {
    test.setTimeout(120000);
    const result = await window.evaluate(async () => {
        // @ts-ignore
        return await window.stage.ai.ask('React\'te custom hook ile Counter yapan ve LocalStorage kullanan bir component yaz. Kod blokları kullan.');
    });
    // console.log('11. Max - React:', result);
    expect(result).toContain('useState');
    expect(result).toContain('useEffect');
    expect(result).toContain('localStorage');
  });

  test('12. Max: AI Ethics Essay', async () => {
    test.setTimeout(120000);
    const result = await window.evaluate(async () => {
        // @ts-ignore
        return await window.stage.ai.ask('Yapay zeka etiği hakkında kısa ama derin bir paragraf yaz. Asimov\'a atıfta bulun.');
    });
    // console.log('12. Max - Essay:', result);
    expect(result.length).toBeGreaterThan(50);
    expect(result).toContain('Asimov');
  });

  test('13. Max: Blockchain Logic', async () => {
    test.setTimeout(120000);
    const result = await window.evaluate(async () => {
        // @ts-ignore
        return await window.stage.ai.ask('Blockchain nasıl çalışır? 5 yaşında bir çocuğa anlatır gibi anlat.');
    });
    // console.log('13. Max - Blockchain:', result);
    expect(result.length).toBeGreaterThan(50);
  });

  test('14. Max: Sentiment Analysis', async () => {
    test.setTimeout(120000);
    const result = await window.evaluate(async () => {
        // @ts-ignore
        return await window.stage.ai.ask('Şu cümlenin duygu analizi nedir: "Kaygılıyım ama başaracağıma inanıyorum." Pozitif/Negatif/Nötr olarak ve nedenini söyle.');
    });
    // console.log('14. Max - Sentiment:', result);
    expect(result.length).toBeGreaterThan(50);
  });

  test('15. Max: Node.js Server Setup', async () => {
    test.setTimeout(120000);
    const result = await window.evaluate(async () => {
        // @ts-ignore
        return await window.stage.ai.ask('Sıfırdan Express.js server kurmak için terminal komutlarını ve basit index.js dosyasını yaz.');
    });
    // console.log('15. Max - Node.js:', result);
    expect(result.length).toBeGreaterThan(20);
  });

});
