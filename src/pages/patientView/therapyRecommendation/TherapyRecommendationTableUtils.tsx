import {
    ITherapyRecommendation,
    EvidenceLevel,
    Modified,
    IRecommender,
    IReference,
} from 'shared/model/TherapyRecommendation';
import AppConfig from 'appConfig';
import _ from 'lodash';
import request from 'superagent';
import * as React from 'react';

export function truncate(
    s: string | undefined,
    n: number,
    useWordBoundary: boolean
) {
    if (!s) return '';
    if (s.length <= n) {
        return s;
    }
    var subString = s.substr(0, n - 1);
    return (
        (useWordBoundary
            ? subString.substr(0, subString.lastIndexOf(' '))
            : subString) + ' [...]'
    );
}

export function getNewTherapyRecommendation(
    patientId: string
): ITherapyRecommendation {
    let now = new Date();
    let timeString = now.toISOString();
    let timeId = now.getTime();
    let therapyRecommendation: ITherapyRecommendation = {
        id: patientId + '_' + timeId,
        comment: [],
        reasoning: {},
        evidenceLevel: EvidenceLevel.NA,
        modifications: [
            {
                modified: Modified.CREATED,
                recommender: {
                    credentials: AppConfig.serverConfig.user_email_address,
                },
                timestamp: timeString,
            },
        ],
        references: [],
        treatments: [],
    };
    return therapyRecommendation;
}

export function getSampleTherapyRecommendation(
    patientId: string
): ITherapyRecommendation {
    let sample = getNewTherapyRecommendation(patientId);
    sample.comment = ['Created: ' + sample.modifications[0].timestamp];
    return sample;
}

export function addModificationToTherapyRecommendation(
    therapyRecommendation: ITherapyRecommendation
): ITherapyRecommendation {
    therapyRecommendation.modifications.push({
        modified: Modified.MODIFIED,
        recommender: {
            credentials: AppConfig.serverConfig.user_email_address,
        },
        timestamp: new Date().toISOString(),
    });
    return therapyRecommendation;
}

export function isTherapyRecommendationEmpty(
    therapyRecommendation: ITherapyRecommendation
): boolean {
    if (
        therapyRecommendation.comment === [] &&
        therapyRecommendation.comment.every(s => s === '') &&
        therapyRecommendation.evidenceLevel === EvidenceLevel.NA &&
        _.isEmpty(therapyRecommendation.reasoning) &&
        therapyRecommendation.treatments.length === 0 &&
        therapyRecommendation.references.length === 0
    ) {
        return true;
    } else {
        return false;
    }
}

export function getReferenceName(reference: IReference): Promise<string> {
    console.log(reference.name);
    return new Promise<string>((resolve, reject) => {
        if (reference.name && reference.name.length !== 0) {
            return name;
        } else {
            const pmid = reference.pmid;
            // TODO better to separate this call to a configurable client
            request
                .get(
                    'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=' +
                        pmid +
                        '&retmode=json'
                )
                .end((err, res) => {
                    if (!err && res.ok) {
                        const response = JSON.parse(res.text);
                        const result = response.result;
                        const uid = result.uids[0];
                        console.log(result[uid].title);
                        resolve(result[uid].title);
                    } else {
                        resolve('');
                    }
                });
        }
    });
}

export function getReferenceNameForId(pmid: number): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        // TODO better to separate this call to a configurable client
        request
            .get(
                'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=' +
                    pmid +
                    '&retmode=json'
            )
            .end((err, res) => {
                if (!err && res.ok) {
                    const response = JSON.parse(res.text);
                    const result = response.result;
                    const uid = result.uids[0];
                    console.log(result[uid].title);
                    resolve(result[uid].title);
                } else {
                    resolve('');
                }
            });
    });
}

export function flattenStringify(x: Array<any>): string {
    let y: any = {};
    x.forEach(function(elem, index) {
        let elemY: any = {};
        for (var i in elem) {
            if (!elem.hasOwnProperty(i)) {
                elem[i] = elem[i];
            }
            elemY[i] = elem[i];
        }
        y[index] = elemY;
    });
    return JSON.stringify(y);
}

export function flattenArray(x: Array<any>): string {
    let y: any = {};
    x.forEach(function(elem, index) {
        let elemY: any = {};
        for (var i in elem) {
            if (!elem.hasOwnProperty(i)) {
                elem[i] = elem[i];
            }
            elemY[i] = elem[i];
        }
        y[index] = elemY;
    });
    return y;
}

export function flattenObject(x: any): any {
    let y: any = {};
    for (var i in x) {
        if (!x.hasOwnProperty(i)) {
            x[i] = x[i];
        }
        y[i] = x[i];
    }
    return y;
}

export function getOncoKbLevelDesc() {
    const levelMap: { [level: string]: JSX.Element } = {
        '1': (
            <span>
                <b>FDA-recognized</b> biomarker predictive of response to an{' '}
                <b>FDA-approved</b> drug <b>in this indication</b>
            </span>
        ),
        '2': (
            <span>
                <b>Standard care</b> biomarker recommended by the NCCN or other
                expert panels predictive of response to an{' '}
                <b>FDA-approved drug</b> in this indication
            </span>
        ),
        '2A': (
            <span>
                <b>Standard care</b> biomarker predictive of response to an{' '}
                <b>FDA-approved</b> drug <b>in this indication</b>
            </span>
        ),
        '2B': (
            <span>
                <b>Standard care</b> biomarker predictive of response to an{' '}
                <b>FDA-approved</b> drug <b>in another indication</b>, but not
                standard care for this indication
            </span>
        ),
        '3A': (
            <span>
                <b>Compelling clinical evidence</b> supports the biomarker as
                being predictive of response to a drug <b>in this indication</b>
            </span>
        ),
        '3B': (
            <span>
                <b>Compelling clinical evidence</b> supports the biomarker as
                being predictive of response to a drug{' '}
                <b>in another indication</b>
            </span>
        ),
        '4': (
            <span>
                <b>Compelling biological evidence</b> supports the biomarker as
                being predictive of response to a drug
            </span>
        ),
        R1: (
            <span>
                <b>Standard care</b> biomarker predictive of <b>resistance</b>{' '}
                to an <b>FDA-approved</b> drug <b>in this indication</b>
            </span>
        ),
        R2: (
            <span>
                <b>Compelling clinical evidence</b> supports the biomarker as
                being predictive of <b>resistance</b> to a drug
            </span>
        ),
    };
    return levelMap;
}
