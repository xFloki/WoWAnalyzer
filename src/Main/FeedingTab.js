import React from 'react';
import PropTypes from 'prop-types';
//import Toggle from 'react-toggle';

import SPELLS from 'common/SPELLS';

import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import Icon from 'common/Icon';

function formatThousands(number) {
  return (Math.round(number || 0) + '').replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
}

function formatNumber(number) {
  if (number > 1000000) {
    return `${(number / 1000000).toFixed(2)}m`;
  }
  if (number > 10000) {
    return `${Math.round(number / 1000)}k`;
  }
  return formatThousands(number);
}

class FeedingTab extends React.Component {
  static propTypes = {
    cooldownTracker: PropTypes.object,
  };

  constructor() {
    super();
    this.state = {
      expand: false,
    };
  }

  render() {
    const { cooldownTracker } = this.props;

    return (
      <div>
        <div className="panel-heading">
          <div className="row">
            <div className="col-md-6">
              <h2>Feeding</h2>
            </div>
            {/*
             <div className="col-md-6 text-right minor-issue-toggle">
             <Toggle
             defaultChecked={this.state.expand}
             icons={false}
             onChange={event => this.setState({ expand: event.target.checked })}
             id="minor-issues-toggle"
             />
             <label htmlFor="minor-issues-toggle">
             <dfn data-tip="Removes Cloudburst Totem, Ancestral Guidance and Ascendance as feeding spells entirely by attributing their healing to the spell that caused this healing to happen.<br /><br />For example, without this option, if you were to cast a 1M Healing Surge with CBT and AG up, this would add to CBT feeding 1M healing from  Healing Surge and 600k healing from AG. With this option, it will add 1.6M healing to Healing Surge and 0 to AG.<br /><br /> This is useful because it gives you a better idea how much each of your healing spells actually contributed to your healing, and allows you to reason better about certain talents and traits.">Attribute indirect healing to feeding spell</dfn>
             </label>
             </div>
             */}
          </div>
        </div>
        <div style={{ padding: 0 }}>

          { ([
            {
              name: "Cloudburst Totem",
              feed: cooldownTracker.cbtFeed,
              spell: SPELLS.CLOUDBURST_TOTEM_CAST,
              totals: cooldownTracker.cbtTotals,
            },
            {
              name: "Ancestral Guidance",
              feed: cooldownTracker.agFeed,
              spell: SPELLS.ANCESTRAL_GUIDANCE_CAST,
              totals: cooldownTracker.agTotals,
            },
            {
              name: "Ascendance",
              feed: cooldownTracker.ascFeed,
              spell: SPELLS.ASCENDANCE_CAST,
              totals: cooldownTracker.ascTotals,
            },
          ]).map((category) => {
            category.max = category.feed.reduce((a, b) => {
              const aHealing = this.state.expand ? a.mergedHealing : a.healing;
              const bHealing = this.state.expand ? b.mergedHealing : b.healing;
              return (aHealing > bHealing) ? a : b;
            }, 0).healing;
            return category;
          })
            .filter((category) => category.totals.total > 0)
            .map((category) => (

              <table className="data-table" key={category.name} style={{ marginTop: 10, marginBottom: 10 }}>
                <thead>
                  <tr>
                    <th style={{ fontSize: '1.25em' }}>

                      <SpellLink id={category.spell.id} style={{ color: '#fff' }}>
                        <SpellIcon id={category.spell.id} noLink /> {category.name}
                      </SpellLink>
                    </th>
                    <th className="text-center" colSpan="3"><dfn data-tip={`The amount of healing done by spells that feed into ${category.name} while it was up.`}>Feeding done per spell</dfn></th>
                    <th className="text-center"><dfn data-tip={`The approximated effective healing each of the spells feeding into ${category.name} did, accounting for overhealing. This should roughly at up to the total effective healing of ${category.name}.`}>Approx. effective healing</dfn></th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(category.feed)
                    .sort((a, b) => {
                      const healingA = category.feed[a].healing;
                      const healingB = category.feed[b].healing;
                      return healingA > healingB ? -1 : (healingB > healingA ? 1 : 0);
                    })
                    .filter((spellId) => (!this.state.expand) || category.feed[spellId].mergedHealing > 0)
                    .map((spellId) => {
                      const ability = category.feed[spellId];
                      const healing = this.state.expand ? ability.mergedHealing : ability.healing;
                      const effectiveHealing = this.state.expand ? ability.mergedEffectiveHealing : ability.effectiveHealing;
                      const totalHealing = this.state.expand ? category.totals.mergedTotal : category.totals.total;

                      return (
                        <tr key={category.name + " " + ability.name}>
                          <td style={{ width: '30%' }}>
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <Icon icon={ability.icon} alt={ability.name} /> {ability.name}
                          </td>
                          <td className="text-right" style={{ width: '10%' }}>
                            {(healing / totalHealing * 100).toFixed(2)}%
                          </td>
                          <td style={{ width: '30%' }}>
                            <div
                              className="performance-bar"
                              style={{ width: `${Math.min(healing / category.max * 100, 100)}%`, backgroundColor: '#70b570' }}
                            />
                          </td>
                          <td style={{ width: '10%' }}>
                            {formatNumber(healing)}
                          </td>
                          <td className="text-center" style={{ width: '20%' }}>
                            {formatNumber(effectiveHealing)}
                          </td>

                        </tr>
                      );
                    })}
                  <tr key={category.name + "Summary"}>
                    <td />
                    <td />
                    <td className="text-right"><b>Total:</b></td>
                    <td className="text-left">
                      <b>{formatNumber(this.state.expand ? category.totals.mergedTotal : category.totals.total)}</b>
                    </td>
                    <td className="text-center">
                      <b>{formatNumber(this.state.expand ? category.totals.mergedTotalEffective : category.totals.totalEffective)}</b>
                    </td>
                  </tr>

                </tbody>
              </table>
            ))
          }
        </div>
      </div>
    );
  }
}

export default FeedingTab;
