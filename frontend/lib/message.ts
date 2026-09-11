  const simulateTyping = async (
    message: string,
    callback: (content: string) => void,
    splits: 'char' | 'word' = 'word'
  ) => {
    const tokens = message.split(splits === 'char' ? '' : ' ');
    let i = 0
    let content = ""

    const typeCharacter = (done: (() => void)) => {
      if (i < tokens.length) {
        const nextToken = tokens[i];

        // const randClick = Math.floor(Math.random() * 3);
        // if (nextToken === " ") {
        //   playWebAudioSound(spaceBufferRef.current, 0.18, 0.05)
        // } else {
        //   playWebAudioSound(clickBufferRefs[randClick].current, 0.12, 0.06)
        // }

        content += (splits === 'char' || i === 0 ? '' : " ") + nextToken
        console.log(content, nextToken);
        callback(content);

        i++
        let nextDelay = 70

        // Berikan jeda berpikir lebih lama jika bertemu titik atau koma (~350ms)
        if ([".", "!", "?", ","].includes(nextToken)) {
          nextDelay = 350
        }
        // Berikan jeda sedikit lebih renggang saat berpindah kata / spasi (~110ms)
        else if (nextToken === " ") {
          nextDelay = 90
        }
        // Berikan variasi acak kecil (micro-timing) pada huruf biasa agar terasa manusiawi
        else {
          // Kecepatan akan bervariasi secara alami antara 60ms hingga 80ms
          nextDelay = nextDelay + (Math.random() * 20 - 10)
        }

        setTimeout(() => typeCharacter(done), nextDelay);
      } else {
        done();
      }
    };

    return new Promise<void>((resolve) => {
      typeCharacter(resolve);
    })
  };

  export { simulateTyping }
