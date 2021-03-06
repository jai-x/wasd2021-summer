import m from 'mithril';

import '../common.css';
import './videoPlayer.css';

const replicants = {
  currentVideo: NodeCG.Replicant('currentVideo', 'wasd'),
  seVideos: NodeCG.Replicant('assets:specialEffectVideos', 'wasd'),
};

class VideoPlayerControl {
  view(vnode) {
    if (vnode.attrs.seVideos.length < 1) {
      return m('h1', 'No Uploaded Videos');
    }

    if (!vnode.attrs.currentVideo.src) {
      vnode.attrs.currentVideo.src = vnode.attrs.seVideos[0].url;
    }

    const playing = (vnode.attrs.currentVideo.state === 'playing');

    return m('.video-control-container', [
      m('.video-control-state', vnode.attrs.currentVideo.state),
      m('select.video-control-select.', {
        disabled: playing,
        onchange: (e) => { vnode.attrs.currentVideo.src = e.target.value; },
      }, vnode.attrs.seVideos.map((v) => {
        return m('option', { value: v.url, selected: v.url === vnode.attrs.currentVideo.src }, v.base)
      })),
      m('.video-control-buttons', [
        m('button.video-control-button', {
          disabled: playing,
          onclick: () => { NodeCG.sendMessageToBundle('currentVideo.start', 'wasd'); }
        }, 'Start'),
        m('button.video-control-button', {
          disabled: !playing,
          onclick: () => { NodeCG.sendMessageToBundle('currentVideo.stop', 'wasd'); }
        },'Stop'),
      ]),
    ]);
  }
}

NodeCG.waitForReplicants(...Object.values(replicants)).then(() => {
  // ensure good state
  replicants.currentVideo.value = { src: '', state: 'stopped' };

  m.mount(document.body, {
    view: () => {
      return m(VideoPlayerControl, {
        currentVideo: replicants.currentVideo.value,
        seVideos: replicants.seVideos.value,
      });
    }
  });
});

Object.values(replicants).forEach((rep) => {
  rep.on('change', () => { m.redraw(); });
});
