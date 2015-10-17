"use strict";
window.onload = main;

class ReferencedTime {
  // 表示用（observe用）時刻生成クラス。

  constructor() {
    this.millisecond = 0;
    this.second = 0;
    this.minute = 0;
    this.hour = 0;
  }

  set_time_msec(msec) {
    this.millisecond = Math.floor(msec / 10) % 100;
    this.second = Math.floor(msec / 1000) % 60;
    this.minute = Math.floor(msec / (1000 * 60)) % 60;
    this.hour = Math.floor(msec / (1000 * 60 * 60)) % 24;
  }

  get_time_strings() {
    return `${this.hour}時間 ${this.minute}分 ${this.second}秒 ${this.millisecond}`;
  }
}

class TimerContainer {
  constructor() {
    // 前回の更新時の時刻を保存しておき、
    // 現在の更新では、これとの差分時刻を残り時間から引く。
    this.previous_time_msec = Date.now();

    // 表示用に整形した時間を入れておくインスタンス。
    this.referenced_time = new ReferencedTime();

    // タイマーの残り時間
    this.remaining_time_msec = 0;

    // setTimeoutのID
    this._timeout_id = null;

    // 更新頻度 setIntervalの何ms間隔で呼び出すか。（setTimeoutを使うなら0で良い。）
    this._interval_of_update = 10;
  }

  update() {
    let current_time_msec = Date.now();
    // 前回の更新時の時刻から経過した時間（ms）を残り時間から引く
    this.remaining_time_msec -= current_time_msec - this.previous_time_msec;

    if (this.remaining_time_msec < 0) {
      // タイマーが0になったら
      this.referenced_time.set_time_msec(0);
      this.stop_timer();
      this.alarm();

      this.remaining_time_msec = 0;
      return;
    }

    // 表示用時刻の更新
    this.referenced_time.set_time_msec(this.remaining_time_msec);
    // 現在の時刻を保存し、次の更新時に用いる。
    this.previous_time_msec = current_time_msec;
  }

  set_timer(remaining_msec) {
    this.remaining_time_msec = remaining_msec;
    this.referenced_time.set_time_msec(remaining_msec);
  }

  start_timer() {
    if (this._timeout_id) {
      // タイマーが動いてる時は無視
      return;
    }

    this.previous_time_msec = Date.now();
    this._timeout_id = setInterval(() => {
      this.update();
    }, this._interval_of_update);

    // setTimeoutではstack sizeがmaxを超えたうんぬんで怒られる…

    // this._timeout_id = setTimeout(function loop() {
    //   self.update();
    //   self._timeout_id = setTimeout(loop(), self._interval_of_update);
    // }, this._interval_of_update);
  }

  stop_timer() {
    if (!this._timeout_id) {
      // タイマーが動いてないときは無視
      return;
    }
    clearInterval(this._timeout_id);
    this._timeout_id = null;
  }

  set_and_start_timer(remaining_mse) {
    this.set_timer(remaining_msec);
    this.start_timer();
  }

  alarm() {
    console.log('alarm!!!!!!!!!!!!!!');
  }

  get_timer_strings() {
    return `${this.referenced_time.get_time_strings()}経過`;
  }
}

function main() {
  window.timer_container = new TimerContainer();
  let timer_span = document.getElementById('timer_text');


  Object.observe(timer_container.referenced_time, function(changes) {
    // この非同期コールバックが変更を収集
    changes.forEach(function(change) {
      timer_span.textContent = timer_container.get_timer_strings();
    });
  });

  // メインの流れはここから


  // getElementsByTagNameを使うといいっぽい。querySelectorAllは遅い。
  // https://www.nczonline.net/blog/2010/09/28/why-is-getelementsbytagname-faster-that-queryselectorall/
  let input_elements = document.getElementsByTagName("input");
  let start_button = input_elements.namedItem("start");
  let pause_button = input_elements.namedItem("pause");
  let reset_button = input_elements.namedItem("reset");
  let timer;
  let timer_setting_msec_text = input_elements.namedItem("timer_setting_msec");

  // タイマーのセット
  timer_container.set_timer(timer_setting_msec_text.value);

  start_button.onclick = function() {
    console.log('click start_button');
    timer_container.start_timer();
  }

  pause_button.onclick = function() {
    timer_container.stop_timer();
  }

  reset_button.onclick = function() {
    console.log('click reset_button');
    timer_container.stop_timer();
    timer_container.set_timer(timer_setting_msec_text.value);
  }

}
